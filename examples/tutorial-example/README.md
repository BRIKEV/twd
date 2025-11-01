# React Router data Example

This example demonstrates the data mode of React Router v7, which is my favorite mode for developing single-page applications (SPAs). It is the simplest approach because it leverages web standards, allowing you to define loaders and actions directly on routes for seamless data fetching and mutation. By using the React Router approach, you can avoid relying on additional state management or request management tools, keeping your application lightweight and straightforward.

This example will include twd-js and test the application with TWD.

For a detailed overview of the features available in data mode, refer to the [React Router API and Mode Availability Table](https://reactrouter.com/start/modes#api--mode-availability-table).

## Installation

To use this mode, install the React Router library:

```bash
npm install react-router
```

## Running This Example

Follow these steps to run the example:

1. **Install Dependencies**  
  Navigate to the project directory and install the required dependencies:

  ```bash
  npm install
  ```

2. **Start the Development Server**  
  Run the following command to start the development server and the fake data which is provided by [json-sever](https://www.npmjs.com/package/json-server).

  ```bash
  npm run serve:dev
  ```

3. **Access the Application**  
  Open your browser and navigate to the URL provided in the terminal to view the application.

---

Feel free to explore the code in this folder to understand how declarative routing is implemented in this example.

## Tools Used in This Example

This example leverages the following tools:

- **React Router**: A library for declarative routing in React applications.
- **json-server**: A simple tool to create a fake REST API for testing and prototyping.
- **twd-js**: A library for testing React applications with TWD.

These tools help demonstrate how data mode works in a practical scenario, with React Router handling navigation and data fetching, json-server providing mock data for the application, and React Router's built-in loaders and actions managing application state seamlessly without requiring additional state management libraries.

