/**
 * Custom Bindings for knockout
 *
 * @source https://github.com/thelinuxlich/knockout_bindings/blob/master/knockout_bindings.js
 */

/** Binding for inline validation - jQuery Validation Plugin
 *  http://bassistance.de/jquery-plugins/jquery-plugin-validation/
 */
ko.bindingHandlers.valueWithAutoValidation = {
  init: ko.bindingHandlers.value.init,
  update: function(element,valueAccessor,allBindingsAccessor) {
    ko.bindingHandlers.value.update.apply(this, arguments);
    $(element).valid();
    var form = $(element.form);
    form.trigger('invalid-form.validate',[form.data("validator")]);
  }
};

/** Binding for form validation - jQuery Validation Plugin
 *  http://bassistance.de/jquery-plugins/jquery-plugin-validation/
 */
ko.bindingHandlers.jqValidate = {
  init: function(element, valueAccessor) {
    var options = valueAccessor();
    $(element).validate(options);
  }
};

/** Binding for adding a mask to input fields - jQuery Masked Input Plugin
 *  http://digitalbush.com/projects/masked-input-plugin/
 */
ko.bindingHandlers.mask = {
  init: function(element, valueAccessor) {
    var options = valueAccessor();
    var mask = "";
    if(options === "date")
      mask = "99/99/9999";
    else if(options === "time")
      mask = "99:99";
    else if(options === "cpf")
      mask = "999.999.999-99";
    else if(options === "phone")
      mask = "(99) 9999-9999";
    else if(options === "cep")
      mask = "99999-999";
    $(element).mask(mask);
  }
};

/** Binding to make content appear with 'fade' effect */
ko.bindingHandlers['fadeIn'] = {
  'update': function(element, valueAccessor) {
    var options = valueAccessor();
    if(options() === true)
      $(element).fadeIn('slow');
  }
};
/** Binding to make content disappear with 'fade' effect */
ko.bindingHandlers['fadeOut'] = {
  'update': function(element, valueAccessor) {
    var options = valueAccessor();
    if(options() === true)
      $(element).fadeOut('slow');
  }
};

/** Binding for stylized buttons - jQuery UI Button Widget
 *  http://jqueryui.com/demos/button/
 */
ko.bindingHandlers.jqButton = {
  init: function(element, valueAccessor) {
    var options = valueAccessor();
    $(element).button(options);
  }
};

/**
 * Binding for jQuery Datatables
 * http://datatables.net
 */
ko.bindingHandlers.dataTable = {
  init: function(element, valueAccessor) {
    var options = valueAccessor();
    var defaults = {
      "aaData": options["data"](),
      "bJQueryUI": true,
      "bFilter": true,
      "bAutoWidth": false,
      "bLengthChange": false,
      "bRetrieve": true,
      "bSortClasses": false,
      "fnRowCallback": function(nRow, aData, iDisplayIndex) {
        $(nRow).mouseover(function(){
          $(nRow).attr("style","background-color:yellow !important;");
        });
        $(nRow).mouseout(function() {
          $(nRow).removeAttr("style");
        });
        if(typeof options["rowClick"] === "function") {
          $(nRow).unbind('click').click(function() {
            options["rowClick"](aData);
          });
        }
        return nRow;
      },
      "oLanguage": TABLE_LANGUAGE
    }
    var tableOptions = $.extend(defaults,options["options"]);
    options["object"]($(element).dataTable(tableOptions).css("width","99.5%"));
  },
  update: function(element,valueAccessor) {
    var options = valueAccessor();
    options["object"]().fnClearTable();
    options["object"]().fnAddData(options["data"](),true);
  }
};

ko.bindingHandlers.jqSlider = {
  init: function(element, valueAccessor, allBindingsAccessor) {
    //initialize the control
    var options = allBindingsAccessor().jqOptions || {};
    $(element).slider(options);

    //handle the value changing in the UI
    ko.utils.registerEventHandler(element, "slidechange", function() {
      //would need to do some more work here, if you want to bind against non-observables
      var observable = valueAccessor();
      observable($(element).slider("value"));
    });

  },
  //handle the model value changing
  update: function(element, valueAccessor) {
    var value = ko.utils.unwrapObservable(valueAccessor());
    $(element).slider("value", value);

  }
};

/** Binding for stylized tabs - jQuery UI Tabs Widget
 *  http://jqueryui.com/demos/tabs/
 */
ko.bindingHandlers.jqTabs = {
  init: function(element, valueAccessor) {
    var options = valueAccessor();
    $(element).tabs(ko.utils.unwrapObservable(options));
  },
  update: function(element,valueAccessor) {
    var options = valueAccessor();
    $(element).tabs('option',ko.utils.unwrapObservable(options));
  }
};

/** Binding for strict MVVM use, associating an observable with the jQuery object of the element */
ko.bindingHandlers.jqElement = {
  init: function(element, valueAccessor) {
    var options = valueAccessor();
    options($(element));
  }
}

/** Binding for accordion widget - jQuery UI Accordion Widget
 *  http://jqueryui.com/demos/accordion/
 */
ko.bindingHandlers.jqAccordion = {
  init: function(element, valueAccessor) {
    var options = valueAccessor();
    var jqElement = $(element);
    jqElement.accordion(options);
    jqElement.bind("valueChanged",function(){
      ko.bindingHandlers.jqAccordion.update(element,valueAccessor);
    });
  },
  update: function(element,valueAccessor) {
    var options = valueAccessor();
    $(element).accordion('destroy').accordion(options);
  }
};

/** Binding for adding stylized and rich multiselect - jQuery UI MultiSelect Widget
 *  http://www.erichynds.com/jquery/jquery-ui-multiselect-widget/
 */
ko.bindingHandlers.jqMultiSelect = {
  init: function(element, valueAccessor,allBindingsAccessor,viewModel) {
    var defaults = {
      click: function(event,ui) {
        var selected_options = $.map($(element).multiselect("getChecked"),function(a) {return $(a).val()});
        allBindingsAccessor()['selectedOptions'](selected_options);
      }
    };
    var options = $.extend(defaults,valueAccessor());
    allBindingsAccessor()['options'].subscribe(function(value) {
      ko.bindingHandlers.jqMultiSelect.regenerateMultiselect(element,options,viewModel);
    });
    allBindingsAccessor()['selectedOptions'].subscribe(function(value) {
      ko.bindingHandlers.jqMultiSelect.regenerateMultiselect(element,options,viewModel);
    });
  },
  regenerateMultiselect: function(element,options,viewModel) {
    if($(element).next().hasClass("ui-multiselect")) {
      setTimeout(function() {
        return $(element).multiselect("refresh").multiselectfilter({
          label: options['filterLabel'] || "Search: "
        });;
      }, 0);
    } else {
      setTimeout(function() {
        if(options['filter'] === true) {
          $(element).multiselect(options).multiselectfilter({
            label: options['filterLabel'] || "Search: "
          });
        } else {
          $(element).multiselect(options);
        }
        if(options['noChecks'] === true) {
          $(element).next().next().find(".ui-helper-reset:first").remove();
        }
      },0);
    }
  }
};

/** Binding for window dialogs - jQuery UI Dialog Widget
 *  http://jqueryui.com/demos/dialog/
 */
ko.bindingHandlers.jqDialog = {
  init: function(element, valueAccessor) {
    var defaults = {
      modal: true,
      autoOpen: false,
      closeOnEscape: false
    }
    var options = $.extend(defaults,valueAccessor());
    $(element).dialog(options);
  }
};

//http://stackoverflow.com/questions/6399078/knockoutjs-databind-with-jquery-ui-datepicker/6400701#6400701
ko.bindingHandlers.jqDatepicker = {
  init: function(element, valueAccessor, allBindingsAccessor) {
    //initialize datepicker with some optional options
    var options = allBindingsAccessor().datepickerOptions || {};
    $(element).datepicker(options);

    //handle the field changing
    ko.utils.registerEventHandler(element, "change", function () {
      var observable = valueAccessor();
      observable($(element).datepicker("getDate"));
      element.blur();
    });

    //handle disposal (if KO removes by the template binding)
    ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
      $(element).datepicker("destroy");
    });

  },
  update: function(element, valueAccessor) {
    var value = ko.utils.unwrapObservable(valueAccessor())
      , current = $(element).datepicker("getDate");

    if(typeof value == 'string'){
      value = new Date(value);
    }

    if (value - current !== 0) {
      $(element).datepicker("setDate", value);
    }
  }
};

ko.numericObservable = function(initialValue) {
  var _actual = ko.observable(initialValue);

  var result = ko.dependentObservable({
    read: function() {
      return _actual();
    },
    write: function(newValue) {
      var parsedValue = parseFloat(newValue);
      _actual(isNaN(parsedValue) ? null : parsedValue);
    }
  });
  result(initialValue);

  return result;
};


ko.booleanObservable = function(initialValue) {
  var _actual = ko.observable(initialValue);

  var result = ko.dependentObservable({
    read: function() {
      return _actual();
    },
    write: function(newValue) {
      if(typeof newValue == 'boolean'){
        _actual(newValue);
      }else if(typeof newValue == 'string'){
        if(newValue == 'true'){
          _actual(true);
        }else if(newValue == 'false'){
          _actual(false);
        }
      }else{
        _actual(null);
        //console.log('Could not interpert boolean value of ',newValue);
      }
    }
  });
  result(initialValue);

  return result;
};


ko.bindingHandlers.fadeVisible = {
  init: function(element, valueAccessor) {
    // Initially set the element to be instantly visible/hidden depending on the value
    var value = valueAccessor();
    $(element).toggle(ko.utils.unwrapObservable(value)); // Use "unwrapObservable" so we can handle values that may or may not be observable
  },
  update: function(element, valueAccessor) {
    // Whenever the value subsequently changes, slowly fade the element in or out
    var value = valueAccessor();
    ko.utils.unwrapObservable(value) ? $(element).stop(true,true).fadeIn() : $(element).stop(true,true).fadeOut();
  }
}


ko.bindingHandlers.slideVisible = {
  init: function(element, valueAccessor) {
    // Initially set the element to be instantly visible/hidden depending on the value
    var value = valueAccessor();
    $(element).toggle(ko.utils.unwrapObservable(value)); // Use "unwrapObservable" so we can handle values that may or may not be observable
  },
  update: function(element, valueAccessor) {
    // Whenever the value subsequently changes, slowly fade the element in or out
    var value = valueAccessor();
    ko.utils.unwrapObservable(value) ? $(element).stop(true,true).slideDown() : $(element).stop(true,true).slideUp();
  }
}

ko.bindingHandlers.jqColorPicker = {
  init: function(element, valueAccessor) {
    $(element).ColorPicker({
      onShow: function (colpkr) {
        $(colpkr).fadeIn(500);
        return false;
      },
      onHide: function (colpkr) {
        $(colpkr).fadeOut(500);
        return false;
      },
      onChange: function (hsb, hex, rgb) {
        $(element).css('backgroundColor', '#' + hex);
        var observable = valueAccessor();
        if(observable){
          observable(hex);
        }
      }
    });

  },
  //handle the model value changing
  update: function(element, valueAccessor) {
    var value = ko.utils.unwrapObservable(valueAccessor());
    $(element).ColorPickerSetColor(value);
    $(element).css('backgroundColor', '#' + value);
  }
}