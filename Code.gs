function getElectivesData(sheetName) {
  // Replace this with your code to fetch electives data from your sheet
  // Example: Assuming electives are in columns A (department) and B (capacity)
  var electivesSheetId = ScriptProperties.getProperty('electivesSheetId')
  var sheet = SpreadsheetApp.openById(electivesSheetId).getSheetByName(sheetName);
  var data = sheet.getDataRange().getValues();
  var electives = {};
  for (var i = 1; i < data.length; i++) {
    electives[data[i][0]] = data[i][1]; // Store department and capacity
  }
  return electives;
}

function getElectivesSheetNames(electiveSpreadsheetId) {
  // var electivesSheetId = ScriptProperties.getProperty('electivesSheetId')
  var ss = SpreadsheetApp.openById(electiveSpreadsheetId)
  var sheets = ss.getSheets();
  var sheetNameArray = []
  var i;
  for(i=0;i<sheets.length;i++){
    sheetNameArray.push(sheets[i].getName())
  }
  Logger.log(sheetNameArray)
  return sheetNameArray
}


function createForm(formFolderId){
  //var folder = DriveApp.getFolderById('1Fdns375sRXaOX0fYO35dkwIjuIvALNwW') // get the UniversityExam folder 0ByrroXF09PRHRVpZaDE0MjlycXM
  //var folderId = folder.getId();
  Logger.log(formFolderId);
  folder = DriveApp.getFolderById(formFolderId)

  var date = new Date();
  var file = FormApp.create("Electives_"+date.getFullYear()+(date.getMonth()+1)+date.getDate()+date.getMinutes());
  var responseSheet = SpreadsheetApp.create("Electives_ResponseSheet_"+date.getFullYear()+(date.getMonth()+1)+date.getDate()+date.getMinutes())
  Logger.log(file);
  var fileId = file.getId();
  DriveApp.getFileById(fileId).moveTo(folder)

  
  
  var responseSheetFileId = responseSheet.getId();
  DriveApp.getFileById(responseSheetFileId).moveTo(folder)

  //folder.addFile(responseSheetFileId);
  var formAndResponseId = [];
  formAndResponseId.push(fileId);
  formAndResponseId.push(responseSheetFileId);

  // when ever a new form and a response sheet is created, the script property dummySheetId will be set to that value
  var scriptProperties = PropertiesService.getScriptProperties();
  scriptProperties.setProperty('dummySheetId',responseSheetFileId)


  Logger.log('formAndResponseId %s',formAndResponseId);
  return formAndResponseId;
}

function electiveDepartmentsAsArray(electiveSpreadsheetId) {
  // get sheetNames
  var sheetNames = getElectivesSheetNames(electiveSpreadsheetId)

  // Get elective data from your separate sheets
  var electiveDepartments = []
  var i=0
  for (i=0;i<sheetNames.length;i++){
    electiveDepartments.push([sheetNames[i],getElectivesData(sheetNames[i])])
  }
  
  Logger.log(electiveDepartments)
  return electiveDepartments
}

function addQuestionToForm(formAndResponseId,electiveSpreadsheetId) {
  // get a array which contains the form and responsesheet Id
  
  form = FormApp.openById(formAndResponseId[0])
  form.setCollectEmail(true)
  form.setProgressBar(true)
  form.setAllowResponseEdits(true)
  form.setLimitOneResponsePerUser(true)
  form.setDestination(FormApp.DestinationType.SPREADSHEET,formAndResponseId[1])
  
  var sectionItemPersonalDetails = form.addSectionHeaderItem().setTitle('Personal Details')
  var itemName = form.addTextItem()
  itemName.setTitle('Your Name')

  var itemUnivRollNo = form.addTextItem()
  itemUnivRollNo.setTitle("University Roll No")

  var electiveDepartmentsArray = electiveDepartmentsAsArray(electiveSpreadsheetId)
  var i=0;
  for(i=0;i<electiveDepartmentsArray.length;i++) {
    const sectionItem = form.addSectionHeaderItem().setTitle(electiveDepartmentsArray[i][0]);
    var sectionIndex = sectionItem.getIndex()

    
    var deptArray = Object.keys(electiveDepartmentsArray[i][1])
    var j = 0;
    for(j=0;j<deptArray.length;j++){
      Logger.log("j="+j)
      var item = form.addListItem()
      item.setRequired(true)
      item.setTitle(electiveDepartmentsArray[i][0] + " " + "Preference " + (j+1))
      item.setChoiceValues(deptArray)
      
    }
    //var item = form.addMultipleChoiceItem()
    //item.setTitle('Your Question Title')
    //item.setChoiceValues(['vanilla', 'chocolate', 'strawberry']).asDropdownList();

  }

  
}

function getDataFromResponseSheet(responseSheetId) {

  // get data from response sheet
  var ss = SpreadsheetApp.openById(responseSheetId)
  var sheet = ss.getSheetByName('Form Responses 1')
  var lastRow = sheet.getLastRow()
  var lastCol = sheet.getLastColumn()

  var range = sheet.getRange(2,1,lastRow-1,lastCol)
  var data = sheet.getSheetValues(2,1,lastRow-1,lastCol)
  Logger.log(data)
  Logger.log(data.length)
  return data
}


function createNumberOfDepartmentsInEachBlockAsScriptProperties(electivesArray) {
  // given the electivesArray, this function will create script properties that tell us how many departments are there in each block
  var scriptProperties = PropertiesService.getScriptProperties();
  var totalDepts = 0
  var i = 0
  for (i=0;i<electivesArray.length;i++) {
    scriptProperties.setProperty(electivesArray[i][0], Object.keys(electivesArray[i][1]).length)
    totalDepts = totalDepts + Object.keys(electivesArray[i][1]).length

    var deptsInBlock = Object.keys(electivesArray[i][1])
    
    const jsonString = JSON.stringify(deptsInBlock);
    if(electivesArray[i][0] != "Control_Panel"){
      scriptProperties.setProperty(electivesArray[i][0] + "_depts", jsonString);
    }
      

  }

  scriptProperties.setProperty('totalDepts', totalDepts)
  scriptProperties.setProperty('noOfBlocks', electivesArray.length)

  return

}

function splitStudentResponse(singleStudentResponse,electivesArray) {
  // this function takes a single students responses and electives array
  // returns a array of arrays of which the first element contains the student personal data, the other elements are students preferences for different blocks
  // eg [['name','age','roll no'],[block 1 preferences], [block 2 preferences], ....]

  var scriptProperties = PropertiesService.getScriptProperties();
  var prop = scriptProperties.getProperty(electivesArray[0][0])
  

  // if there is no script property named in the name of a block posting then call hte function that creates it
  if (!prop){
    createNumberOfDepartmentsInEachBlockAsScriptProperties(electivesArray)
  }

  var totalDepts = scriptProperties.getProperty('totalDepts')
  
  var noOfBlocks = electivesArray.length

  var splitArray = [] // this is the array to be returned
  Logger.log("singleStudentResponse.length" + singleStudentResponse.length)
  Logger.log("totalDepts" + totalDepts)
  var personalInfoArrayLength = singleStudentResponse.length - totalDepts
  Logger.log('personalInfoArrayLength')
  Logger.log(personalInfoArrayLength)
  var personalInfo = singleStudentResponse.slice(0,personalInfoArrayLength)

  splitArray.push(personalInfo)

  var remainingArray = singleStudentResponse.slice(personalInfoArrayLength)
  Logger.log(remainingArray)
  var i =0
  for(i=0;i<noOfBlocks;i++) {
    var blockProp = scriptProperties.getProperty(electivesArray[i][0])
    Logger.log(blockProp)
    var blockPreference = remainingArray.slice(0,blockProp)
    remainingArray = remainingArray.slice(blockProp)
    splitArray.push(blockPreference)

  }
  Logger.log(splitArray)
  return splitArray
}

function fitStudentToDept(splitStudentPreferenceArray,vacanyInElectiveDepartmentsAsArray){
  Logger.log("Inside fitStudentToDept")
  // given the splitStudentPrefenceArray(got from splitStudentResponse) and
  // vacanyInElectiveDepartmentsAsArray (initially it will got from electiveDepartmentsAsArray)

  var scriptProperties = PropertiesService.getScriptProperties();
  var prop = scriptProperties.getProperty('noOfBlocks')

  // if there is no script property named in the name of 'noOfBlocks' then call hte function that creates it
  if (!prop){
    createNumberOfDepartmentsInEachBlockAsScriptProperties(vacanyInElectiveDepartmentsAsArray)
  }
  
  var studentAllotment = {'name':splitStudentPreferenceArray[0][2]}

  // for each block
  var i = 0;
  for (i=0;i<prop;i++){
    
    //  cycle through the block 1 preferences, find the department with vacancies > 0 and the preferences are of least number

    // gives the block number
    var blockNumber = i + 1
    var j = 0;
    var allotedStatus = false
    Logger.log("splitStudentPreferenceArray" + splitStudentPreferenceArray)
    Logger.log("typeof of splitStudentPrefrencesArray" + splitStudentPreferenceArray)
    Logger.log("splitStudentPreferenceArray[blockNumber",splitStudentPreferenceArray[blockNumber])
    Logger.log(splitStudentPreferenceArray)
    Logger.log("blockNumber " + blockNumber)
    Logger.log(splitStudentPreferenceArray[blockNumber])
    for(j=0;j<splitStudentPreferenceArray[blockNumber].length; j++) {
      var preferredDept = splitStudentPreferenceArray[blockNumber][j]
      Logger.log('preferred Dept is ' + preferredDept)
      var vacancyInPrefDept = vacanyInElectiveDepartmentsAsArray[i][1][preferredDept]
      Logger.log(vacanyInElectiveDepartmentsAsArray[i][1][preferredDept])

      // if the vacancy in that Dept is > 0 , then assign the student to that dept, and break the loop.
      if (vacancyInPrefDept > 0) {
        studentAllotment[vacanyInElectiveDepartmentsAsArray[i][0]] = preferredDept
        allotedStatus = true
        
        // substract 1 from existing vacancy
        vacanyInElectiveDepartmentsAsArray[i][1][preferredDept] = (vacanyInElectiveDepartmentsAsArray[i][1][preferredDept]) - 1
        break;
      }
      // else continue with the loop
    }
    if (allotedStatus == false) {
      studentAllotment[splitStudentPreferenceArray[0][2]] = "WAITLISTED"
    }
    // if the student is not alloted to any department, put him to waitlist category.

    

    // substract 1 from the vacany of that particular department.

    // repeat the same for block 2
  }
  

Logger.log(studentAllotment)
Logger.log(vacanyInElectiveDepartmentsAsArray)
return([studentAllotment, vacanyInElectiveDepartmentsAsArray])
}

function allotForAllStudents(allStudentsResponseArray,responseSheetId){
  var noOfStudents = allStudentsResponseArray.length
  var electivesArray = electiveDepartmentsAsArray(ScriptProperties.getProperty('electivesSheetId'))

  // get the names of the blocks in an array
  var electiveBlocksArray = []

  //var splitPrefArray = splitStudentResponse(allStudentsResponseArray[0],electivesArray)

  //var fitting = fitStudentToDept(splitPrefArray,electivesArray)
  //var allotment = fitting[0]
  var j=0
  for(j=0;j<electivesArray.length;j++){
    electiveBlocksArray.push(electivesArray[j][0])
  }
  Logger.log('electivesBlockArray')
  Logger.log(electiveBlocksArray)


  var allotmentMatrix = []
  var header = ['Name'].concat(electiveBlocksArray) 

  allotmentMatrix.push(header)
  Logger.log('allotmentMatrix')
  Logger.log(allotmentMatrix)

  var i=0;
  var vacancyDict = electivesArray
  for(i=0;i<noOfStudents;i++){
    var individualAllotment = []
    var splitPrefArray = splitStudentResponse(allStudentsResponseArray[i],vacancyDict)
    var fitting = fitStudentToDept(splitPrefArray,vacancyDict)
    var allotment = fitting[0]
    var vacancyDict = fitting[1]
    individualAllotment.push(allotment['name'])
    Logger.log(individualAllotment)
    var k = 0;
    for(k=0;k<electiveBlocksArray.length;k++) {
      individualAllotment.push(allotment[electiveBlocksArray[k]])
      Logger.log(individualAllotment)
    }
    allotmentMatrix.push(individualAllotment)
    //break
  }

  Logger.log(allotmentMatrix)

  var ss = SpreadsheetApp.openById(responseSheetId)
  try{
    var sheet = ss.insertSheet("Allotment_Matrix")
  }
  catch (error) {
    var sheet = ss.getSheetByName("Allotment_Matrix")
  }
  

  var noOfRows = allotmentMatrix.length
  var noOfColumns = allotmentMatrix[0].length
  var range = sheet.getRange(1,1,noOfRows,noOfColumns)

  range.setValues(allotmentMatrix)
  

  

  
}


function removeDuplicatesWithFilterInOrder(arr) {
  // Create a new set to track seen values
  const seen = new Set();
  // Filter the array, keeping only unique elements
  var modifiedArray =  arr.filter((value) => {
    // Check if value is not already in the set
    const isUnique = !seen.has(value);
    // Add the value to the set for future checks
    seen.add(value);
    
    return isUnique;
  });
  Logger.log(modifiedArray);
  return modifiedArray
}

function convertJSONstringToArray(jsonString){
  // this function takes a string which was jsonified from an array
  // returns a array
  
  const retrievedArray = JSON.parse(jsonString);
  Logger.log(retrievedArray)
  return retrievedArray
}

function findWhatIsMissingInArray(smallerArray,masterArray){
  // this function takes 2 arrays smallerArray being a subset of the larger Array
  // this function will output the missing elements in smaller array that are there in masterArray in a form of a Array
  
  const missingElements = masterArray.filter(element => !smallerArray.includes(element));
  Logger.log(missingElements)
  
  return(missingElements)
}

function responseSheetPreprocess(responseSheetId){
  // ,electivesArray
  // this function shall take the responseSheetId as input
  // var responseSheetId = ScriptProperties.getProperty('dummySheetId')
  var newData = []
  var allStudentsResponseArray = getDataFromResponseSheet(responseSheetId)
  var noOfStudents = allStudentsResponseArray.length

  var scriptProperties = PropertiesService.getScriptProperties();
  var electivesArray = electiveDepartmentsAsArray(scriptProperties.getProperty('electivesSheetId'))

  var i=0;
  for(i=0;i<noOfStudents;i++){
    var individualStudentData = allStudentsResponseArray[i]
    var individualStudentSplitData = splitStudentResponse(individualStudentData,electivesArray)
    Logger.log("Inside responseSheetPreprocess")
    Logger.log(individualStudentSplitData)
    
    var partialNewData = individualStudentSplitData[0]
    Logger.log('partialNewData')
    Logger.log(partialNewData)

    var j = 1;
    for(j=1;j<individualStudentSplitData.length;j++){
      var blockPref = individualStudentSplitData[j]

      var blockPrefWithoutDuplicates = removeDuplicatesWithFilterInOrder(blockPref)
      Logger.log('blockPrefWithoutDuplicates')
      Logger.log(blockPrefWithoutDuplicates)

      // search for corresponding script property
      var scriptPropName = "Block_" + j.toString() + "_depts"
      var deptsInThisBlockJSONString = scriptProperties.getProperty(scriptPropName)

      var deptsInThisBlock = convertJSONstringToArray(deptsInThisBlockJSONString)
      Logger.log('deptsInThisBlock')
      Logger.log(deptsInThisBlock)

      var missingDeptsInPref = findWhatIsMissingInArray(blockPrefWithoutDuplicates,deptsInThisBlock)

      Logger.log('missingDeptsInPref')
      Logger.log(missingDeptsInPref)

      // creating a random permutation of the missingDeptsArray
      var randomPermMissingDepts = randomPermutation(missingDeptsInPref)

      var newPrefForBlockForThisStudent = blockPrefWithoutDuplicates.concat(randomPermMissingDepts)
      Logger.log('newPrefForBlockForThisStudent')
      Logger.log(newPrefForBlockForThisStudent)
      Logger.log(newPrefForBlockForThisStudent.length)
      partialNewData = partialNewData.concat(newPrefForBlockForThisStudent) 
      Logger.log('partialNewData')
      Logger.log(partialNewData)
      Logger.log(partialNewData.length)
    }
    newData.push(partialNewData)
    
  }
  Logger.log("new data")
  Logger.log(newData)

  var ss = SpreadsheetApp.openById(responseSheetId)
  var sheet = ss.getSheets()[0]
  var noOfRows = newData.length
  var noOfColumns = newData[0].length
  var range = sheet.getRange(2,1,noOfRows,noOfColumns)

  range.setValues(newData)
  
  // iterates through each student response, 
    // each block (beware the naming pattern that is used to store the department in script properties.)
    // finds the missing departments
    // puts that in a random permutation
    // combines the original unique responses and the random permutation of the missing departments
    // stores it in a master array

  // set the values of the modified responses in the spreadsheet.
}
