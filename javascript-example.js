// Traditional function
function add(a, b) {
    return a + b;
}

// Arrow function
const add = (a, b) => a + b;

// Key Features
//Implicit Return
const square = x => x * x;
console.log(square(4)); // Output: 16

// No Own this
// Regular function (`this` refers to the object `obj1`)
const obj1 = {
    value: 10,
    regularFunc: function() {
        console.log(this.value);  // Logs 10
    }
};
obj1.regularFunc();  // Output: 10
// Arrow function (`this` refers to a global object that does not exist)
const obj2 = {
    value: 20,
    arrowFunc: () => {
        console.log(this.value);  // Logs undefined (this doesn't refer to obj2)
    }
};
obj2.arrowFunc();  // Output: undefined

// Practical Examples
// Using Arrow Functions with Array Methods
const numbers = [1, 2, 3, 4];
const doubled = numbers.map(n => n * 2);
console.log(doubled); // Output: [2, 4, 6, 8]

//Concise Event Handlers
document.addEventListener('click', () => {
    console.log('Page clicked!');
});


// When Not to Use Arrow Functions
// When Using this Explicitly
const obj = {
    value: 42,
    method: () => this.value // `this` here refers to the global context, not `obj`
};
console.log(obj.method()); // Output: undefined

// When Creating Constructor Functions
// This will throw an error:
const Person = (name) => {
    this.name = name;
};
const p = new Person('Alice'); // Error: Person is not a constructor

// Promises
const promise = new Promise((resolve, reject) => {
    const success = true; // Change to false to test rejection.

    if (success) {
        resolve("The operation was successful!");
    } else {
        reject("The operation failed.");
    }
});

promise
    .then((message) => {
        console.log("Fulfilled:", message);
    })
    .catch((error) => {
        console.error("Rejected:", error);
    })
    .finally(() => {
        console.log("Promise has settled.");
    });

// Relating Promises to Try/Catch/Finally
try {
    // Synchronous code that might throw an error
    const result = "Success!";
    console.log("Result:", result);
} catch (error) {
    // "Catch" (handle) any errors that occur
    console.error("Error:", error);
} finally {
    // Code that runs "finally", regardless of success or failure
    console.log("Operation complete.");
}

// Chaining Promises with then()
const step1 = () => {
    return new Promise((resolve) => {
        console.log("Step 1 completed.");
        resolve("Step 1 result");
    });
};
const step2 = (prevResult) => {
    return new Promise((resolve) => {
        console.log("Step 2 completed with:", prevResult);
        resolve("Step 2 result");
    });
};
step1()
    .then(step2)
    .then((finalResult) => {
        console.log("All steps completed. Final result:", finalResult);
    });

// Try It
// Handling Errors with catch()
const failingStep = () => {
    return new Promise((resolve, reject) => {
        reject("Something went wrong!");
    });
};
failingStep()
    .then((result) => {
        console.log("This will not run:", result);
    })
    .catch((error) => {
        console.error("Caught an error:", error);
    })
    .finally(() => {
        console.log("Execution finished.");
    });

// Understanding Async/Await
// Old way with Promises
fetchUserData()
    .then(user => fetchUserPosts(user))
    .then(posts => {
        console.log(posts);
    })
    .catch(error => {
        console.log("Error:", error);
    });

// New way with async/await
async function getUserPosts() {
    try {
        const user = await fetchUserData();
        const posts = await fetchUserPosts(user);
        console.log(posts);
    } catch (error) {
        console.log("Error:", error);
    }
}

// Real-World Example: Spotify API Call
const getPlaylist = async () => {
    try {
        console.log("Loading playlist...");
        const playlist = await spotifyAPI.getPlaylist('top_hits');
        const tracks = await spotifyAPI.getPlaylistTracks(playlist.id);
        return tracks;
    } catch (error) {
        console.log("Couldn't load playlist:", error);
    }
};
// Using it is simple:
getPlaylist().then((tracks) => {
    console.log(`Here are the playlist tracks!\\n${tracks}`);
});

// Practical Exercise
// Simulates getting menu data
function getMenu() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                'Burger',
                'Pizza',
                'Tacos',
                'Sushi'
            ]);
        }, 1500);
    });
}
// Simulates placing an order
function placeOrder(food) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (food) {
                resolve(`Your ${food} order has been placed!`);
            } else {
                reject('Please select a food item!');
            }
        }, 2000);
    });
}
// Simulates order preparation
function prepareOrder(order) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (order.includes('placed')) {
                resolve('Your food is ready for pickup! 🍔');
            } else {
                reject('Something went wrong with your order!');
            }
        }, 3000);
    });
}
// Using Promises (the traditional way)
function orderFoodWithPromises() {
    console.log('Starting your order (Promise version)...');
    getMenu()
        .then(menu => {
            console.log('Menu items:', menu);
            return placeOrder(menu[0]);
        })
        .then(orderMessage => {
            console.log(orderMessage);
            return prepareOrder(orderMessage);
        })
        .then(ready => {
            console.log(ready);
        })
        .catch(error => {
            console.log('Error:', error);
        })
        .finally(() => {
            console.log('Order process complete. (Simulation Competed)');
        });
}
// Using async/await (the modern way)
async function orderFoodWithAsync() {
    try {
        console.log('Starting your order (async/await version)...');
        const menu = await getMenu();
        console.log('Menu items:', menu);
        const orderMessage = await placeOrder(menu[0]);
        console.log(orderMessage);
        const ready = await prepareOrder(orderMessage);
        console.log(ready);
    } catch (error) {
        console.log('Error:', error);
    } finally {
        console.log('Order process complete. (Simulation Competed)');
    }
}
// Try both versions!
orderFoodWithPromises();
// orderFoodWithAsync();


// ESM example
// math.js
const add = (a, b) => {
    return a + b;
};
export default add;
// app.js
import { add } from './math.js';
console.log(add(2, 3)); // Output: 5

// math.js
const add = (a, b) => {
    return a + b;
};
const subtract = (a, b) => {
    return a - b;
};
export { add, subtract }; // <-- 2 3 5 Single combined export app js import add subtract from math console log Output -1 code>

// Create a Module
export function sayHello(name) {
    return `Hello, ${name}!`;
}
// Import and Use the Module
import { sayHello } from './greetings.js';
console.log(sayHello('Alice')); // Output: Hello, Alice!