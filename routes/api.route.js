const { PrismaClient } = require("@prisma/client");
const router = require("express").Router();

const prisma = new PrismaClient();

// Helper function for standard response format
const sendResponse = (res, data, message) => {
  res.send({
    status: 200,
    data,
    message
  });
};

// Helper function to handle errors
const handleError = (error, next) => {
  console.error(error);
  next(error);
};

router.get("/products", async (req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      include: { category: true }
    });
    sendResponse(res, products, "Successfully Get All Products");
  } catch (error) {
    handleError(error, next);
  }
});

router.get("/products/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id: Number(id) },
      include: { category: true },
    });
    sendResponse(res, product, `Successfully Retrieved Product ${id}`);
  } catch (error) {
    handleError(error, next);
  }
});

router.post("/products", async (req, res, next) => {
  try {
    const newProduct = await prisma.product.create({
      data: req.body,
      include: { category: true }
    });
    sendResponse(res, newProduct, "Product created successfully");
  } catch (error) {
    handleError(error, next);
  }
});

router.delete("/products/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.delete({
      where: { id: Number(id) },
      include: { category: true },
    });
    sendResponse(res, product, `Product ${id} deleted successfully`);
  } catch (error) {
    handleError(error, next);
  }
});

router.patch("/products/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.update({
      where: { id: Number(id) },
      data: req.body,
      include: { category: true },
    });
    sendResponse(res, product, `Product ${id} updated successfully`);
  } catch (error) {
    handleError(error, next);
  }
});

router.post("/multiProduct", async (req, res, next) => {
  try {
    const [newProduct, products] = await prisma.$transaction([
      prisma.product.create({
        data: req.body,
        include: { category: true }
      }),
      prisma.product.findMany({
        include: { category: true }
      })
    ]);
    
    sendResponse(res, { newProduct, products }, "Product created successfully");
  } catch (error) {
    handleError(error, next);
  }
});

router.post("/multiProduct2", async (req, res, next) => {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: req.body,
        include: { category: true }
      });

      const updatedProduct = await tx.product.update({
        where: { id: product.id },
        data: req.body,
        include: { category: true },
      });

      const allProducts = await tx.product.findMany({
        include: { category: true }
      });

      const anotherProduct = await tx.product.create({
        data: req.body,
        include: { category: true }
      });

      return {
        product,
        updatedProduct,
        allProducts,
        anotherProduct
      };
    });

    sendResponse(res, result, "Transaction completed successfully");
  } catch (error) {
    handleError(error, next);
  }
});

module.exports = router;
