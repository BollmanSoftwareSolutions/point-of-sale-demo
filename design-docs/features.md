# Overview
This is a point of sale application demo.
This will run at the cash register for a fast food business.
The app has minimal security with an id and pin based login.
The primary function is to take customer orders.
It has a secondary function of displaying orders to a kitchen monitor so that employees know what orders to build and any modifications from standard ingredients.
The last function is to retrieve previous orders and provide refunds if needed.

Payments are handled externally through an API call.

All API calls are mocked and data is seeded in the project.

The app is optimized for a large tablet display, from 1280x1024 to 1920x1080.

The app has 4 screens:
1. Login
2. Ordering
3. Order History
4. Kitchen

## 1. Login
The login page will have a number pad, 0-9 with the letters A, B, C, D.

Above the number pad is an input field with hint text that says to enter employee ID.
The input values are not masked.
An employee ID is 6 digits. 0-9, A-D.
A submit button is below the input field.

Once the user submits their user ID, the field is red with an error message if the employee isn't found.
Successful entry shows another input field with hint text to enter their PIN.
The pin input is masked.
The pin is 4 digits 0-9.

Successful input redirects the user to the Ordering page.

For this demo, there should be a message at the bottom of the page with a user id and pin for a valid test user.

### Number pad layout
|  |  |  |  |
| --- | --- | --- | --- |
| A | 1 | 2 | 3 |
| B | 4 | 5 | 6 |
| C | 7 | 8 | 9 |
| D |   | 0 |   |

## 2. Ordering

The order screen has 4 vertical panes. 

A footer is visible with navigation to Order History and Kitchen screens.

|  | Pane 1 | Pane 2 | Pane 3 | Pane 4 |
| --- | --- | --- | --- | --- |
| Level | Category | Category Items | Item selection and modifcation | Order summary |
| Description | A collection of categories. | Specific items in the category, not necessarily unique. | Individual items and their modifiers. | Vertical list of items and prices. |
| Examples | Categories like Combos, Burgers, Drinks, Desserts as a vertical stack of buttons with icon and text |  Items like Combo #2 or Cheeseburger as a vertical stack of buttons with icon and text | A combo would have a horizontal section for Burger with ingredients and modifications, another horizontal section for a side with options for fries, tatertots, or onion rings, another horizontal section for drink with size and kind. | Vertical stack of items like "Cheeseburger 5.20" with price and modifiers like "Add Pickles 0.10" or "No Cheese -0.50" under it. |

Pane 3 has a footer with a button "Add to Order" that adds that selection and its modifications to the order. That is displayed in Pane 4.

Pane 4 has a footer with a button "Go to Payment". That button converts Pane 3 to payment functionality. It has buttons to select payment method, ex. card, cash, gift certificate. There is a number pad, 0-9, to input the payment amount. They must enter the full amount including cents. No decimal button. Partial payments are allowed. A button "Submit Payment" adds the payment to the order and subtracts it from the total. Multiple payments must add up to the total before a "Complete Order" button is displayed. That button finishes the order and saves it, the order status is Kitchen.


## 3. Order History
The Order History screen has two vertical sections. The top section is a search with text input and date range selection.

The bottom section is a data grid that displays the order search results, newest to oldest. It shows the Order Id, Date, the order status, and a comma delimited list of the names of the items truncated at 20 characters. There should be 10 rows visible on the page. Use pagination to go through the list.

| Order # | Date | Status | Items |
| --- | --- | --- | --- |
| The order id | Date and time of order | Status, like Fulfilled, Kitchen, Refund | Item names, truncated at 30 characters |

Clicking a row converts the orders data grid to a pane that displays the menu items like the Pane 4 order summary from the order screen. It shows the payment types and amounts. A button "Refund" that marks the order as refunded.

Mock 15 orders for seed data.

A footer is visible with navigation to Order History and Kitchen screens.
 

## 4. Kitchen
There is a single pane with 8 sections. New orders are pushed into the next available section, left to right starting at the top, as a card with the order details less prices. The Order number is displayed at top large and bold. The order details are sized for 8 lines visible. Any overflow lines are automatically scrolled every 10 seconds.

The bottom of the card has a single button "Completed" that sets the order status to Fulfilled and removes the card from the screen. All other cards are shifted to the left or up to the top row.

If there are more than 8 orders then the orders will only come onto the screen when one of the displayed orders are completed.

A footer is visible with navigation to Order History and Kitchen screens.


# Security
The order, history, and kitchen screens are only available once a user has logged in with user id and pin.

All orders are tagged with the user id when created.

A mock user should be created for the project.

# Menu
Nested object with the structure below. Items do not need to be unique, ex. a cheeseburger may be part of burgers and a la carte categories.
```
{
    menu: {
        category: // This maps to Pane 1
        [{
            name: Simple Name, // Button Text
            icon: Icon Id, // Button Icon
            category items: // This maps to Pane 2 
            [{
                name: Simple Name, // Button Text
                icon: Icon Id, // Button Icon
                items: // This maps to Pane 3 
                [{
                    display name: Full Name,
                    base price: Decimal price, // Price without any modifications
                    sizes: // Empty if only 1 size, ex. Cheeseburger. Multiple for something like a drink 
                    [{
                        name: text,
                        price modifier: Decimal price // Add or subtract from base price, 0.00 for default selection
                    }],
                    modifiers: // List of ingredients or options, ex. Ketchup, 2x Cheese. May be empty
                    [{
                        name: text,
                        price modifier: Decimal price
                    }],
                    options: // This might be for a side that isn't a modifier, ex. Drink type, side type
                    [{
                        name: text,
                        price modifier: Decimal price
                    }]
                }]
            }]
        }]
    }
}
```

A demo menu should be populated based on a mexican fast food restaurant like Taco Bell, Taco Bueno, or Taco John's.