const express = require("express");
const repository = require("./repository");
const mercadopago = require("mercadopago");
const app = express();
const port = process.env.PORT || 3000;

mercadopago.configure({
  access_token:
    "TEST-5006053877100296-033002-9ad01ba2f421ede88a57dfc40efb5bb4-424758103",
});

app.use(express.json());

app.get("/api/products", async (req, res) => {
  res.send(await repository.read());
});

app.post("/api/pay", async (req, res) => {
  const order = req.body;
  const ids = order.items.map((p) => p.id);
  const productsCopy = await repository.read();

  let preference = {
    items: [],
    back_urls: {
      success: "http://localhost:3000/feedback",
      failure: "http://localhost:3000/feedback",
      pending: "http://localhost:3000/feedback",
    },
    auto_return: "approved",
  };

  let error = false;
  ids.forEach((id) => {
    const product = productsCopy.find((p) => p.id === id);
    if (product.stock > 0) {
      product.stock--;
      preference.items.push({
        title: product.name,
        unit_price: product.price,
        quantity: 1,
      });
    } else {
      error = true;
    }
  });

  if (error) {
    res.send("Sin stock").statusCode(400);
  } else {
    const response = await mercadopago.preferences.create(preference);
    const preferenceId = response.body.id;
    await repository.write(productsCopy);
    order.date = new Date().toISOString();
    order.preferenceId = preferenceId;
    order.status = "pending";
    const orders = await repository.readOrders();
    orders.push(order);
    await repository.writeOrders(orders);
    res.send({ preferenceId });
  }
});

app.get("/feedback", async (req, res) => {
  const payment = await mercadopago.payment.findById(req.query.payment_id);
  const merchantOrder = await mercadopago.merchant_orders.findById(payment.body.order.id);
  const preferenceId = merchantOrder.body.preference_id;
  const status = payment.body.status;
  await repository.updateOrderByPreferenceId(preferenceId, status);

  res.sendFile(require.resolve("./frontend/index.html"));
});

app.use("/", express.static("frontend"));

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
