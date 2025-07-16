# Review TODOs

- [ ] Check how to add sonar qube static analysis to the project
- [ ] Add GitHub actions to run tests on each PR and push to main branch
- [ ] Fix the README.md to be by the project - move only related nx commands to a separate NX Build section in the readme

# DONE

- [x] Fix in all use cases to throw BusinessRuleError when validation fails for required fields
- [x] Add on each git commit to do prettier and eslint checks
- [x] check and use sprintf-js lib instead of formatMessage in error-utils.ts
- [x] Implement error handling add custom exception for business use cases called BusinessRuleError, It should have these fields:
  - `errorCode: ErrorCode` - where errorCode is enum with ErrorID(ErrorNumber) the number is unique number for the error and has an HTTP status code as prefix and 9999 for business errors, e.g. 4009999 for bad request errors
  - `message: stgring`
  - `details?: any[]`
  - `timestamp: Date`
- [x] Remove daily cleanup routines we want to keep the data for historical analysis
- [x] Find base32 lib to reuse
