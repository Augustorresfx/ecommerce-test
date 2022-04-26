const btn = document.querySelector("button.mobile-menu-button");
const menu = document.querySelector(".mobile-menu");

btn.addEventListener("click", () => {
    menu.classList.toggle("hidden");
});

let productList = [];
let carrito = [];
let total = 0;
let order = {
  items: [],
};

function add(productId, price) {
  const product = productList.find((p) => p.id === productId);
  product.stock--;

  order.items.push(productList.find((p) => p.id === productId));

  console.log(productId, price);
  carrito.push(productId);
  total = total + price;
  document.getElementById("checkout").innerHTML = `Carrito $${total}`;
  displayProducts();
}

async function showOrder() {
  document.getElementById("all-products").style.display = "none";
  document.getElementById("order").style.display = "block";

  document.getElementById("order-total").innerHTML = `$${total}`;

  let productsHTML = `
    <tr>
        <th>Cantidad</th>
        <th>Detalle</th>
        <th>Subtotal</th>
    </tr>`;
  order.items.forEach((p) => {
    productsHTML += `<tr>
            <td>1</td>
            <td>${p.name}</td>
            <td>$${p.price}</td>
        </tr>`;
  });
  document.getElementById("order-table").innerHTML = productsHTML;
}

async function pay() {
  try {
    order.shipping = {
      name: document.getElementById("name").value,
      email: document.getElementById("email").value,
      phone: document.getElementById("phone").value,
      addressLine1: document.getElementById("addressLine1").value,
      addressLine2: document.getElementById("addressLine2").value,
      city: document.getElementById("city").value,
      postalCode: document.getElementById("postalCode").value,
      state: document.getElementById("state").value,
      country: document.getElementById("country").value,
    };

    const preference = await (
      await fetch("/api/pay", {
        method: "post",
        body: JSON.stringify(order),
        headers: {
          "Content-Type": "application/json",
        },
      })
    ).json();

    var script = document.createElement("script");

    // The source domain must be completed according to the site for which you are integrating.
    // For example: for Argentina ".com.ar" or for Brazil ".com.br".
    script.src =
      "https://www.mercadopago.com.ar/integrations/v1/web-payment-checkout.js";
    script.type = "text/javascript";
    script.dataset.preferenceId = preference.preferenceId;
    script.setAttribute("data-button-label", "Pagar con Mercado Pago");
    document.getElementById("order-actions").innerHTML = "";
    document.querySelector("#order-actions").appendChild(script);

    document.getElementById("name").disabled = true;
    document.getElementById("email").disabled = true;
    document.getElementById("phone").disabled = true;
    document.getElementById("addressLine1").disabled = true;
    document.getElementById("addressLine2").disabled = true;
    document.getElementById("city").disabled = true;
    document.getElementById("postalCode").disabled = true;
    document.getElementById("state").disabled = true;
    document.getElementById("country").disabled = true;
  } catch {
    window.alert("Sin stock");
  }

  carrito = [];
  total = 0;
  order = {
    items: [],
  };
  //await fetchProducts();
  document.getElementById("checkout").innerHTML = `Carrito $${total}`;
}

//-----
function displayProducts() {
  document.getElementById("all-products").style.display = "block";
  document.getElementById("order").style.display = "none";

  const hombre = productList.filter((p) => p.category === "hombre");
  displayProductsByType(hombre, "product-cards-hombre");

  const mujer = productList.filter((p) => p.category === "mujer");
  displayProductsByType(mujer, "product-cards-mujer");

}

function displayProductsByType(productsByType, tagId) {
  let productsHTML = "";
  productsByType.forEach((p) => {
    let buttonHTML = `<button id="button-add" class="bg-gradient-to-r from-green-500 to-blue-500 rounded-full text-gray-50 self-center py-2 px-4 flex flex-row hover:from-green-500 hover:to-green-500" onclick="add(${p.id}, ${p.price})">Agregar</button>
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-6 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
</button>`;

    if (p.stock <= 0) {
        buttonHTML = `<button id="button-out-of-stock" class="bg-gradient-to-r from-red-500 to-red-400 rounded-full text-gray-50 self-center py-2 px-4 flex flex-row hover:from-red-500 hover:to-red-500" onclick="add(${p.id}, ${p.price})>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-6 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        Sin stock
   </button>`;
    }

    productsHTML +=
    `
    <div class="shadow-xl m-4 rounded-tl-lg rounded-tr-lg">
        <a href="#">
            <img class="rounded-lg" src="${p.image}">
        </a>
        <div class="p-5">
            <p>${p.name}</p>
             <p>$${p.price}</p>
        <div class="flex flex-row my-3">
              <div class="bg-black h-5 w-5 rounded-full shadow-md mr-2"></div>
             <div class="bg-white h-5 w-5 rounded-full shadow-md mr-2"></div>
              <div class="bg-blue-800 h-5 w-5 rounded-full shadow-md mr-2"></div>
            </div>
        <div class="flex flex-row my-3">
              <div class="border-2 border-gray-300 text-gray-400 rounded-md text-xs px-2 py-1 mr-2">S</div>
               <div class="border-2 border-gray-300 text-gray-400 rounded-md text-xs px-2 py-1 mr-2">M</div>
              <div class="border-2 border-gray-300 text-gray-400 rounded-md text-xs px-2 py-1 mr-2">L</div>
              <div class="border-2 border-gray-300 text-gray-400 rounded-md text-xs px-2 py-1 mr-2">XL</div>
        </div>
        <div class="flex flex-row justify-between">
        ${buttonHTML}     
        </div>             
        </div>
        </div>           


    `;
  });
  document.getElementById(tagId).innerHTML = productsHTML;
}

async function fetchProducts() {
  productList = await (await fetch("/api/products")).json();
  displayProducts();
}

window.onload = async () => {
  await fetchProducts();
};
