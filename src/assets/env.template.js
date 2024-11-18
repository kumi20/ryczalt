(function(window) {
    window.env = window.env || {};

    window["env"]["domain"] = "${APILINK}";
    window["env"]["authDomain"] = "${AUTHAPI}";
    window["env"]["APIGUS"] = "${APIGUS}";
    window["env"]["AUTHAPI"] = "${AUTHAPI}";
    window["env"]["ABS_BUILD_DATE"] = "${ABS_BUILD_DATE}";
    window["env"]["ABS_BUILD_ID"] = "${ABS_BUILD_ID}";

    window["env"]["CAS_CLIENT_ID"] = "${CAS_CLIENT_ID}";
  })(this);
