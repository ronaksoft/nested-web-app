# Code Documentation
We use [JSDoc 3](http://usejsdoc.org/) standards to describe how the code works. Here are some examples that help you through writing a well-formed documentation for your code.
## Example 1
A method to add two numbers and return the result.
```javascript
/**
 * sum - Add two numbers and returns the result
 *
 * @param  {Number} a first number
 * @param  {Number} b second number
 * @return {Number}   the result of summation
 */
function sum(a, b) {
  return a + b;
}
```
## Example 2
A service that wraps Angular $http service and performs CRUD operations.
```javascript

/**
 * dataservice - a service to perform CRUD operations
 *
 * @param  {$http}      $http       Angular default $http service
 * @param  {$q}         $q          Angular default $q service
 * @param  {exception}  exception   service
 * @param  {logger}     logger      logger service
 */
function dataservice($http, $q, exception, logger) {
    var service = {
        get: get,
        add: add,
    };

    return service;

    /**
     * get - send an HTTP GET request with provided query
     *
     * @param  {object}  a set of key-values that the method
     *                   uses to build a query string
     * @return {Promise} a Promise that resolves the response
     *                   that was recieved from API
     */
    function get(query) {
        // implementation details go here
    }

    /**
     * add - send an HTTP POST request to store the model in db
     *
     * @param  {object} the model
     * @return {type}   a Promise that resolves the response
     *                  that was recieved from API
     */
    function add(model) {
        // implementation details go here
    }
}

```
