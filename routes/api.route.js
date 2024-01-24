const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const router = require("express").Router();

router.get("/products", async (req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      include: { Category: true }
    });
    res.send({
      status: 200,
      data: products,
      message: "Successfully Get All Products",
    });
  } catch (error) {
    next(error);
  }
});

router.get("/products/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id: Number(id) },
      include: { Category: true },
    });
    res.send({
      status: 200,
      data: product,
      message: `Successfully ${id} Get Data`,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/products", async (req, res, next) => {
  try {
    const newProduct = await prisma.product.create({
      data: req.body,
    });
    res.send({
      status: 200,
      data: newProduct,
      message: "Product is created successfully",
    });
  } catch (error) {
    next(error);
  }
});

router.delete("/products/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.delete({
      where: { id: Number(id) },
      include: { Category: true },
    });
    res.send({
      status: 200,
      data: product,
      message: `Successfully Product ${id} Deleted Data`,
    });
  } catch (error) {
    next(error);
  }
});

router.patch("/products/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.update({
      where: { id: Number(id) },
      data: req.body,
      include: { Category: true },
    });
    await prisma.$disconnect();
    return res.send({
      status: 200,
      data: product,
      message: `Successfully Product ${id} Updated Data`,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/multiProduct", async (req, res, next) => {
  try {
    const [newProduct, getdata] = await prisma.$transaction([
      prisma.product.create({
        data: req.body,
      }),
      prisma.product.findMany().catch((error) => {
        console.log("-----right-----", error);
      }),
    ]);
    console.log(newProduct, getdata);
    await prisma.$disconnect();

    res.send({
      status: 200,
      data: newProduct,
      message: "Product is created successfully",
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.post("/multiProduct2", async (req, res, next) => {
  try {
    const newProduct = await prisma.$transaction(async (prisma) => {
      const product = await prisma.product.create({
        data: req.body,
      });
      console.log(product);

      const updateproduct = await prisma.product.update({
        where: { id: Number(product.id) },
        data: {},
        include: { Category: true },
      });
      console.log("update", updateproduct);
      const productdata = await prisma.product.findMany().catch((error) => {
        console.log("-----right-----", error);
      });
      console.log(productdata);
      const product3 = await prisma.product.create({
        data: req.body,
      });
      console.log(product3);

      res.send({
        status: 200,
        data: {
          product: product,
          updateproduct: updateproduct,
          productdata: productdata,
          product3: product3,
        },
        message: "Product is created successfully",
      });
    });
  } catch (error) {
    console.log(error);
    next(error);
  } finally {
    console.log("---Finally---");
    await prisma.$disconnect();
  }
});

module.exports = router;
