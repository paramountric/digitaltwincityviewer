# Data Model

how to use, in package

visualise using mermaid? or deck.gl? (show how metadata can be used inside of viz)

## Types

Types are available in the model package as generated from the database schema.

Then there are some helper function to wrap and transform the types to camelCase and a format that is easier to use in the app.

The principles are that when data is fetched from the database a helper function can be used to transform the data to the app runtime.

Then when data is saved back to the database the correspoding helper function should be used to transform the data back to the database format.
