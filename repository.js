const { google } = require("googleapis");

const oAuth2Client = new google.auth.OAuth2(
  "982692914206-cvbvv7iqe8podibmb4k2bmmpkn294tkt.apps.googleusercontent.com",
  "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",
  "urn:ietf:wg:oauth:2.0:oob"
);

oAuth2Client.setCredentials({
  access_token:
    "ya29.A0ARrdaM8EBF-tG19xoc0AhvGu7utxGBCZyHc662f9M7e-ZjbXzOOwATa9Bu_Qhe2HYK8jFmwvZdR1yVs_kfThSDbc0LUei_5e2fO6DLYaoSdtGJwCbdYYbnO2OlH2aen_aqJxHHCL0-mJ8Twg1y3MejEeqpJt",
  refresh_token:
    "1//0hxNKUQVaVuo0CgYIARAAGBESNwF-L9Ir0TfdE4Xo6mEJwHOXwbcPL-KXOcthYJl5LuRmU1-4SqvZYcv5AgmN1aPnZXYyeNgM0YM",
  scope: "https://www.googleapis.com/auth/spreadsheets",
  token_type: "Bearer",
  expiry_date: 1650903279013,
});

const sheets = google.sheets({ version: "v4", auth: oAuth2Client });

async function read() {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: "11k2OzOKsrZW0-jZf1q6Zao_OqH8hAKOi06MIcroaUV8",
    range: "Products!A2:F",
  });

  const rows = response.data.values;
  const products = rows.map((row) => ({
    id: +row[0],
    name: row[1],
    price: +row[2],
    image: row[3],
    stock: +row[4],
    category: row[5],
  }));

  return products;
}

async function write(products) {
  let values = products.map((p) => [p.id, p.name, p.price, p.image, p.stock, p.category]);

  const resource = {
    values,
  };
  const result = await sheets.spreadsheets.values.update({
    spreadsheetId: "11k2OzOKsrZW0-jZf1q6Zao_OqH8hAKOi06MIcroaUV8",
    range: "Products!A2:F",
    valueInputOption: "RAW",
    resource,
  });
}

async function writeOrders(orders) {
  let values = orders.map((order) => [
    order.date,
    order.preferenceId,
    order.shipping.name,
    order.shipping.email,
    JSON.stringify(order.items),
    JSON.stringify(order.shipping),
    order.status,
  ]);

  const resource = {
    values,
  };
  const result = await sheets.spreadsheets.values.update({
    spreadsheetId: "11k2OzOKsrZW0-jZf1q6Zao_OqH8hAKOi06MIcroaUV8",
    range: "Orders!A2:G",
    valueInputOption: "RAW",
    resource,
  });
}

async function readOrders() {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: "11k2OzOKsrZW0-jZf1q6Zao_OqH8hAKOi06MIcroaUV8",
    range: "Orders!A2:G",
  });

  const rows = response.data.values || [];
  const orders = rows.map((row) => ({
    date: row[0],
    preferenceId: row[1],
    name: row[2],
    email: row[3],
    items: JSON.parse(row[4]),
    shipping: JSON.parse(row[5]),
    status: row[6],
  }));

  return orders;
}

async function updateOrderByPreferenceId(preferenceId, status) {
  const orders = await readOrders();
  const order = orders.find(o => o.preferenceId === preferenceId)
  order.status = status;
  await writeOrders(orders);
}

module.exports = {
  read,
  write,
  writeOrders,
  updateOrderByPreferenceId,
  readOrders,
};
