/**
 * Testing the page specification
 */
var DataElement = require('./NEWDataElement');
var dataElemArray = [];
var config;
// Not sure exactly what is happening here. 
// for(var el in dataElements){
//  dataElemArray.push(new DataElement(el));
// }
// 
describe('DataElement', function() {
  for(var ii = 0; ii < dataElemArray.length; ii++) {
    describe('DataElement n :' + ii, function() {
      
      it('It should be an instance of DataElement', function() {
        expect(dataElemArray[ii]).to.be.an.instanceof(DataElement);
      });
      
      it('Data element should be associated to at least 1 page, and this association is a number', function() {
        expect(dataElemArray[ii].pageIds.length).to.be.above(0);
        expect(dataElemArray[ii].pageIds[0]).to.be.a('number');
      });
      
      it('Data element should have a name that will be a string', function() {
        expect(dataElemArray[ii].name).to.be.a('string');
      });
      
      it('Data element should have a selector that will be a string', function() {
        expect(dataElemArray[ii].selector).to.be.a('string');
      });
      
      it('Data element should have a regex that will be a string', function() {
        expect(dataElemArray[ii].regex).to.be.a('string');
      });
      
    });
  }
});