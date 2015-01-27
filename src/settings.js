/*
 *
 * This module is what determine the settings
 * for each module used in the application.
 */

var rawSettings = window.veTagData.settings.gdm;

module.exports = {
  gdm: rawSettings.gdm || {
    exclude: rawSettings.exclude,
    flexId: rawSettings.flexId,
    gdmConversionCode: rawSettings.gdmConversionCode,
    gdmSegementId: rawSettings.gdmSegementId
  },
  genie: {
    gdmConversionCode: rawSettings.gdmConversionCode,
    gdmSegementId: rawSettings.gdmSegementId,
    completionId: rawSettings.completionId,
    journeyCode: rawSettings.journeyCode,
    segmentIds: rawSettings.segmentIds,
    orderId: rawSettings.orderId,
    orderValue: rawSettings.orderValue,
    completePage: rawSettings.completePage,
    ros: rawSettings.ros,
    basketPages: rawSettings.basketPages,
    productPages: rawSettings.productPages
  },
  namespace: 'veapps.' + (rawSettings.flexId || '') + (rawSettings.journeyCode || '') + '.GDM.',
  version: require('../package.json').version.split('.')
};