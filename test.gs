function test_getElectivesData(){
  var electivesSheetId = ScriptProperties.getProperty('electivesSheetId')
  Logger.log(getElectivesData('block_1'))
}

function test_getElectivesSheetNames() {
  getElectivesSheetNames(ScriptProperties.getProperty('electivesSheetId'))
}

function test_createForm() {
  createForm(ScriptProperties.getProperty('formFolderId'))
}

function test_electiveDepartmentsAsArray(){
  electiveDepartmentsAsArray(ScriptProperties.getProperty('electivesSheetId'))
}

function test_addQuestionToForm(){
  var formAndResponseId = createForm(ScriptProperties.getProperty('formFolderId'))
  var electivesSheetId = ScriptProperties.getProperty('electivesSheetId')
  addQuestionToForm(formAndResponseId, electivesSheetId)
}

function test_randomPermutation(){
  randomPermutation([1,2,3,4,5])
}

function test_generateDummyEmails(){
  generateDummyEmails(length=15)
}

function test_createAdummyRow(){
  createAdummyRow([[1,2,3,4,5],['a','b','c','d','e']])
}

function test_createDummyData(){
  var electiveSpreadsheetId = ScriptProperties.getProperty('electivesSheetId')
  createDummyData(electiveSpreadsheetId,10)
}

function test_populateDummyDataToSpreadsheet(){
  var electiveSpreadsheetId = ScriptProperties.getProperty('electivesSheetId')
  var dummyId = ScriptProperties.getProperty('dummySheetId')
  Logger.log(dummyId)
  SpreadsheetApp.openById(dummyId)
  var dummyData = createDummyData(electiveSpreadsheetId,150)
  populateDummyDataToSpreadsheet(dummyId,dummyData)

}

function test_getDataFromResponseSheet() {
  var responseSheetId = ScriptProperties.getProperty('dummySheetId')
  getDataFromResponseSheet(responseSheetId)
}

function test_updateDictionary(){
  a = {'a':1,'b':2,'c':3}
  Logger.log(a)
  Logger.log(a['b'])
  a['b'] = a['b'] - 1
  Logger.log(a['b'])
  Logger.log(a.keys.length)
}

function test_createNumberOfDepartmentsInEachBlockAsScriptProperties() {

  var scriptProperties = PropertiesService.getScriptProperties();

  //var prop = scriptProperties.getProperty("Block_1_Array")
  //Logger.log(prop)
  //if (!prop){
  createNumberOfDepartmentsInEachBlockAsScriptProperties(electiveDepartmentsAsArray(scriptProperties.getProperty('electivesSheetId')))
  //}
  
}

function test_splitStudentResponse(){
  var responseSheetId = ScriptProperties.getProperty('dummySheetId')
  var dummyData = getDataFromResponseSheet(responseSheetId) 
  var singleStudentData = dummyData[0]
  var electivesArray = electiveDepartmentsAsArray(ScriptProperties.getProperty('electivesSheetId'))
  splitStudentResponse(singleStudentData,electivesArray)

}

function test_fitStudentToDept() {
  var responseSheetId = ScriptProperties.getProperty('dummySheetId')
  var dummyData = getDataFromResponseSheet(responseSheetId) 
  var singleStudentData = dummyData[0]
  var electivesArray = electiveDepartmentsAsArray(ScriptProperties.getProperty('electivesSheetId'))
  var splitArray = splitStudentResponse(singleStudentData,electivesArray)

  Logger.log("Inside test_fitStudetnToDept")
  Logger.log("splitArray" + splitArray)
  Logger.log(splitArray)
  fitStudentToDept(splitArray,electivesArray)
}

function test_allotForAllStudents(){
  var responseSheetId = ScriptProperties.getProperty('dummySheetId')
  var allStudentsResponseArray = getDataFromResponseSheet(responseSheetId) 
  allotForAllStudents(allStudentsResponseArray,responseSheetId)
}

function test_arrayJoining(){
  a = [1,2]
  b = [3,4]
  c = a.concat(b)
  Logger.log(c)
}

function test_removeDuplicatesWithFilterInOrder(arr) {
  removeDuplicatesWithFilterInOrder([1,1,2,3,5,5,7,8,5,9])
}

function test_convertJSONstringToArray(){
  var scriptProperties = PropertiesService.getScriptProperties();
  var storedString = scriptProperties.getProperty("Block_1_depts");
  convertJSONstringToArray(storedString)
}

function test_findWhatIsMissingInArray(){
  findWhatIsMissingInArray([1,2,3],[1,2,3,4])
}

function test_responseSheetPreprocess(){
  var responseSheetId = ScriptProperties.getProperty('dummySheetId')
  responseSheetPreprocess(responseSheetId)
}

