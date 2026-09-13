# SwiftBasket

A small e-commerce demo site: browse products, add/remove items from a live-updating
cart, "pay" through a simulated checkout, and view all placed orders from an admin page.


## Project structure

```
project/
├── public/              # Static frontend — can be opened directly or served
│   ├── index.html        # Storefront
│   ├── admin.html         # Admin dashboard (list of orders)
│   ├── css/
│   │   ├── style.css
│   │   └── admin.css
│   ├── js/
│   │   ├── cart.js         # Cart + checkout logic
│   │   └── admin.js        # Fetches and renders orders for admin.html
│   └── photos/            # Product images
├── server/               # Backend (Node + Express)
│   ├── server.js           # Serves the frontend + order API
│   ├── package.json
│   └── data/orders.json    # Orders are stored here (auto-created)
└── README.md
```
FrontEnd
BackEnd
Authorization
DataBase
Merchant Login??

Members- Aashish Raut,Aashish Upadhyay,Himal Saud
