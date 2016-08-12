(function() {
  Polymer({
    is: 'prototype-4',

    properties: {

      /*
       * all the campuses that are provided in the data
       * (matches to filter options displayed)
       */
      displayCampusList: {
        type: Array,
        value: []
      },
      selectedCampusList: {
        type: Array,
        value: [],
        notify: true
      },
      areMultipleCampuses: Boolean,


      displayMonthList: {
        type: Array,
        value: []
      },
      selectedMonthList: {
        type: Array,
        value: [],
        notify: true
      },
      areMultipleMonths: Boolean,


      displayedEvents: {
        type: Array
      },

      allEvents: {
        type: Array
      }


    },

    observers: [
      'filterChangeCampus(selectedCampusList.selected)',
      'filterChangeMonth(selectedMonthList.selected)'
    ],

    filterChangeCampus: function (_selected) {
      console.log(this);
//         this.set(selectedCampusList.selected) = _selected;
    },
    filterChangeMonth: function (_selected) {
//         this.set(selectedMonthList.selected) = _selected;
    },


    ready: function() {
      this.$.trainingApi.get();
    },

    /*
     * setup the data on first load
     */
    _setupData: function(e) {
      var events = e.detail;
      var campuses = [];
      var months = [];

      var that = this;

      // extract all the filter collections
      events.forEach(function(event){
        event.startDateFormatted = "";
        event.filterDate = "";
        // setup the formatted date for display
        if (event.start) {
          event.startDateFormatted = moment(event.start).format('ddd D MMM YYYY');
          event.filterDate = moment(event.start).format('MMM YYYY');
        }


        if (event.categories && event.categories.campus) {
          event.categories.campus.forEach(function(campus){
            if (campuses.indexOf(campus) < 0) {
              campuses.push(campus);
            }
          });
        }

        if (months!== undefined && event.filterDate != "" && months.indexOf(event.filterDate) < 0) {
          months.push(event.filterDate);
        }

      });

      // store the possible list of campuses
      this.displayCampusList = campuses;
      this.areMultipleCampuses = (this.displayCampusList !== undefined && this.displayCampusList.length > 1);

      // initially select all campus options
      campuses.forEach(function (aCampus) {
        var newCampus = {};
        newCampus.name = aCampus;
        newCampus.selected = true;
        that.selectedCampusList.push(newCampus);
      });

      this.displayMonthList = months;
      this.areMultipleMonths = (this.displayMonthList !== undefined && this.displayMonthList.length > 1);
      // initially select all months
      months.forEach(function (aMonth) {
        var newMonth = {};
        newMonth.display = aMonth;
        newMonth.selected = true;
        that.selectedMonthList.push(newMonth);
      });

      // filters are 'select all' initially
      this.displayedEvents = events;

      this.allEvents = events;
    },

    /*
     * resets all the filters to their default position
     */
    resetFilters: function() {
      var that = this;
      this.selectedCampusList.forEach(function(c) {
        console.log(c);
//            c.set("c.selected", true);
        c.selected = true;
      });
      this.selectedMonthList.forEach(function(m) {
        m.selected = true;
//            m.set("selected", true);
      });
      // todo text field

      this.refilterData();
    },

    /*
     * if the campus of the event matches one of the campuses selected in the filter, return true
     * otherwise, return false
     * we are assuming there is only ever one entry in event.categories.campus
     */
    _eventIsOnAFilteredCampus: function(_event) {
      if (!(_event.categories && _event.categories.campus)) { return false; }

      eventCampus = _event.categories.campus;

      var _displayable = false;
      if (this.selectedCampusList !== undefined && 0 < this.selectedCampusList.length) {
        this.selectedCampusList.forEach(function (campusFilter) {
          if (eventCampus == campusFilter.name && campusFilter.selected) {
            _displayable = true;
          }
        });
      }
      return _displayable;
    },

    /*
     * returns true if the event's start date is currently ticked in the filter
     */
    _eventIsInAFilteredMonth: function(event) {
      var _displayable = false;
      if (this.selectedMonthList !== undefined && 0 < this.selectedMonthList.length) {
        this.selectedMonthList.forEach(function(monthFilter) {
          if (event.filterDate && event.filterDate == monthFilter.display
            && monthFilter.selected) {
            _displayable = true;
          }
        });
      }
      return _displayable;
    },



    /*
     * the filter selection has been changed - refilter the data for display
     */
    refilterData: function() {
      var that = this;
      var processedEvents = [];

      // clear the display data
      this.displayedEvents = [];

      // for each event, check if the filters allow display
      this.allEvents.forEach(function(e) {
        if (that._eventIsOnAFilteredCampus(e)
          && that._eventIsInAFilteredMonth(e)
        // && text filter check TODO
        ) {
          processedEvents.push(e);

        }

      });
      this.displayedEvents = processedEvents;

    },



    _formatLabelForDisplay: function(aName) {
      var _labeldisplay = aName;
      var _positionDot = aName.lastIndexOf(".");
      if (-1 !== _positionDot) {
        _labeldisplay = aName.substr(_positionDot + 1);
      }
      return _labeldisplay;
    }


  });
})();
