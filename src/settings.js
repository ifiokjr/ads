/*
 *
 * This module is what determine the settings
 * for each module used in the application.
 * 
 */

var rawSettings = window.veTagData.settings.veAds || window.veTagData.settings.gdm;

module.exports = {
  gdm: rawSettings.gdm || {
    exclude: rawSettings.exclude,
    flexId: rawSettings.flexId,
    gdmConversionCode: rawSettings.gdmConversionCode,
    gdmSegementId: rawSettings.gdmSegementId
  },
  genie: {
    gdmConversionCode: rawSettings.gdmConversionCode,
    gdmSegementId: rawSettings.gdmSegementId || rawSettings.gdmSegmentId,
    completionId: rawSettings.completionId,
    journeyCode: rawSettings.journeyCode,
    segmentIds: rawSettings.segmentIds,
    orderId: rawSettings.orderId,
    orderValue: rawSettings.orderValue,
    completePage: rawSettings.completePage,
    ros: rawSettings.ros,
    basketPages: rawSettings.basketPages,
    productPages: rawSettings.productPages,
    dbm: rawSettings.dbm || {} // fallback for older versions that don't have this
  },
  dbm: rawSettings.dbm,
  namespace: 'veapps.' + (rawSettings.flexId || '') + (rawSettings.journeyCode || '') + '.GDM.',
  version: [1,3,1]
};