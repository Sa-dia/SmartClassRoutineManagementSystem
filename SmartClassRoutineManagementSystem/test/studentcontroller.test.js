const chai = require("chai");
const sinon = require("sinon");
const fs = require("fs");
const path = require("path");
const { uploadStudentAsXML } = require("../controllers/studentController");
const db = require("../config/db");

const { expect } = chai;

// Load test cases directly from test.json
const testCasesPath = path.join(__dirname, "test.json");
const testCases = JSON.parse(fs.readFileSync(testCasesPath, "utf8"));

describe("Student Controller", () => {
  beforeEach(() => {
    sinon.stub(db, "query"); // Mock the database query method
  });

  afterEach(() => {
    sinon.restore(); // Restore original methods after each test
  });

  // Iterate over all test cases from test.json
  testCases.forEach((testCase) => {
    it(testCase.description, async () => {
      // Mock request and response objects
      const req = { body: testCase.input };
      const res = {
        status: sinon.stub().returnsThis(),
        send: sinon.stub()
      };

      // Set up database behavior based on execution condition
      if (testCase.executionCondition === "Database query succeeds") {
        db.query.callsFake((query, values, callback) => {
          callback(null, { affectedRows: 1 }); // Simulate successful query
        });
      } else if (testCase.executionCondition === "Database query fails") {
        db.query.callsFake((query, values, callback) => {
          callback(new Error("Database error"), null); // Simulate database error
        });
      }

      // Execute the function to be tested
      await uploadStudentAsXML(req, res);

      // Verify the response matches the expected output
      expect(res.status.calledWith(testCase.expectedOutput.status)).to.be.true;
      expect(res.send.calledWith(testCase.expectedOutput.message)).to.be.true;
    });
  });
});
