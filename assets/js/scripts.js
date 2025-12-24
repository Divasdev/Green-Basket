const timerDays = document.querySelector(".timer-days");
const timerHours = document.querySelector(".timer-hours");
const timerSecs = document.querySelector(".timer-seconds");
const timerMins = document.querySelector(".timer-minutes");
const futureDate = document.getElementById("promo-timer");

// Read future date
const endTime = new Date(futureDate.dataset.endsAt).getTime();


 const CartBadge=document.querySelector(".cart-badge");


function setTimer() {
   const now = Date.now();
   let remaining = endTime - now;

   if (remaining <= 0) {
      timerDays.textContent = "00";
      timerHours.textContent = "00";
      timerMins.textContent = "00";
      timerSecs.textContent = "00";
      clearInterval(interval);
      return;
   }

   const seconds = Math.floor((remaining / 1000) % 60);
   const minutes = Math.floor((remaining / (1000 * 60)) % 60);
   const hours = Math.floor((remaining / (1000 * 60 * 60)) % 24);
   const days = Math.floor(remaining / (1000 * 60 * 60 * 24));

   timerDays.textContent = String(days).padStart(2, "0");
   timerHours.textContent = String(hours).padStart(2, "0");
   timerMins.textContent = String(minutes).padStart(2, "0");
   timerSecs.textContent = String(seconds).padStart(2, "0");

}
setTimer();
const interval = setInterval(setTimer, 1000);





const addProducts = document.querySelectorAll(".product-addtocart");

addProducts.forEach(button => {
   button.addEventListener("click", (e) => {

      const clickedButton = e.currentTarget;
      const productCard = clickedButton.closest('.product-body')
      ;
      const productName = productCard.querySelector(".product-name").textContent
      .trim();
      const productPrice = productCard.querySelector(".product-price").textContent
      .trim();
     
     
       

     const product={
          name:productName,
          price:productPrice
     };
     let cart =localStorage.getItem("cart");


     if (cart){
      cart = JSON.parse(cart);

     } else{
      cart=[];
     }
     cart.push(product);

     localStorage.setItem("cart", JSON.stringify(cart));

     console.log("cart Saved:", cart);
      cartLength=cart.length;
       
   
     CartBadge.textContent=cartLength;
    
     clickedButton.textContent = "Added To Cart";


   });
});

const savedCart = localStorage.getItem("cart");

if (savedCart) {
  const cart = JSON.parse(savedCart);
  CartBadge.textContent = cart.length;
} else {
  cartBadge.textContent = 0;
}