app.factory('AnswerData', function() {
    var answerData = {};
    answerData['data'] = {};
    
    answerData.set = function(data) {
        answerData['data'] = data;   
    };
    
    answerData.get = function() {
        return answerData['data'];
    };
    
    return answerData;
});