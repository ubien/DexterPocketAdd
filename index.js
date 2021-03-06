var rest   = require('restler');
var _ = require('lodash');
var Q = require('q');

module.exports = {
    /**
     * The main entry point for the Dexter module
     *
     * @param {AppStep} step Accessor for the configuration for the step using this module.  Use step.input('{key}') to retrieve input data.
     * @param {AppData} dexter Container for all data used in this workflow.
     */
    run: function(step, dexter) {
        if(!step.input('url')) {
            return this.fail({
                message: 'Array urls is required',
                input: step.inputs()
            });
        }


        var self = this;

        var data = {
            consumer_key: dexter.environment('pocket_consumer_key'),
            access_token: dexter.environment('pocket_access_token')
        };

        var result = true;
        var promises = [];
        _.each(step.input('url'), function(url) {
            data['url'] = url;
            promises.push(
              rest.post("https://getpocket.com/v3/add", {data : data}).on('complete', function(result, response) {
                  try {
                      if(response.statusCode != 200) {
                          result = result && true;
                      }else{
                          result = result && false;
                      }
                  } catch(e) {
                      /* ignore any error parsing and just return null */
                      self.fail(e);
                  }
              })
            );
        });
        Q.all(promises).then(self.complete(result));
    }
};
