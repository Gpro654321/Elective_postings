
function createDummyData(electiveSpreadsheetId,noOfDummyRows){
  // create dummy data of 150 rows
  var dummyData = []

  var j = 0;
  for(j=0;j<noOfDummyRows;j++){
    var arrayOfBlock = []
  
    var electiveDepartmentsArray = electiveDepartmentsAsArray(electiveSpreadsheetId)
    var i=0;
    for(i=0;i<electiveDepartmentsArray.length;i++) {
      var deptArray = Object.keys(electiveDepartmentsArray[i][1])
      arrayOfBlock.push(randomPermutation(deptArray))
    }
    dummyData.push(createAdummyRow(arrayOfBlock))
  }
  
  
  

  Logger.log(dummyData)
  return dummyData
}

function randomPermutation(arr) {
  // Use the Fisher-Yates shuffle algorithm for efficient mixing
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  Logger.log(arr)
  return arr;
}

function generateDummyEmails(length = 15) {
  const domains = ["example.com", "fakemail.org", "tempmail.xyz"]; // Add more domains if needed
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";

  const emails = [];
  
  let username = "";
  for (let j = 0; j < length; j++) {
    username += chars[Math.floor(Math.random() * chars.length)];
  }
  const email = username + "@" + domains[Math.floor(Math.random() * domains.length)];
  
  Logger.log(email);
  return email;
}



function createAdummyRow(arrayOfBlock) {
  var timestamp = Date.now()
  var dummyEmail = generateDummyEmails(length = 15)
  var dummyName = dummyEmail
  var dummyUnivNo = dummyEmail


  var dummyRow = [timestamp,dummyEmail, dummyName, dummyUnivNo]
  var i=0;
  for(i=0;i<arrayOfBlock.length;i++){
    dummyRow = dummyRow.concat(arrayOfBlock[i])
  }
  Logger.log(dummyRow)
  return(dummyRow)
}

function populateDummyDataToSpreadsheet(dummySheetId,dummyData){
  var ss = SpreadsheetApp.openById(dummySheetId)
  var sheet = ss.getSheets()[0]
  var noOfRows = dummyData.length
  var noOfColumns = dummyData[0].length
  var range = sheet.getRange(2,1,noOfRows,noOfColumns)

  range.setValues(dummyData)
  
}

