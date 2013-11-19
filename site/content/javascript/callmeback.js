$(function() {
    function t() {
        return Array.prototype.slice.call(arguments).join('');
    }

    function populateDatesThisWeek() {
        $.getJSON('/javascript/england-and-wales.js', function(d) {
            var bankHolidays = d.events.map(function(e) {
                return moment(e.date);
            });

            var parent = $('#callbackcallday');
            parent.empty();
            [0, 1, 2, 3, 4, 5, 6].forEach(function(o) {
                var date = moment().add('days', o);

                var skip = false;
                bankHolidays.forEach(function(b) {
                    if (b.format('YYYYMMDD') == date.format('YYYYMMDD')) {
                        skip = true;
                    }
                });

                if (!skip) {
                    var html = t('<option value="', date.format('d'), '">', date.format("dddd (D/M/YYYY)"), '</option>');
                    parent.append(html);
                }
            });
            
            $('#callmeback').validate();
        });
        
    }

    function populateHours(weekday) {
        var dates = [];
        switch(weekday) {
        case 0: // Sunday
            break;
        case 6: // Saturday
            [9, 10, 11, 12].forEach(function(h) {
                [0, 15, 30, 45].forEach(function(m) {
                    if (!(h == 12 && m > 29)) {
                        var date = moment().hour(h).minute(m);
                        dates.push(date);
                    }
                });
            });
            break;
        default: // Weekday
            [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19].forEach(function(h) {
                [0, 15, 30, 45].forEach(function(m) {
                    var date = moment().hour(h).minute(m);
                    dates.push(date);
                });
            });
        }

        var parent = $('#callbacktime');
        parent.empty();
        dates.forEach(function(d) {
            var html = t('<option value="', d.format('HHmm'), '">', d.format('HH:mm A'), '</option>');
            parent.append(html);
        });
    }

    function dayChangedHandler(e) {
        var offset = e.target.selectedIndex;
        var selectedDay = moment().add('days', offset);
        populateHours(selectedDay.weekday());
    }

    function languageChangedHandler(e) {
        var element = $('#CallBackDisabilityOptions');
        switch(e.target.value) {
        case 'English':
        case 'Welsh':
            element.show();
            break;
        default:
            element.hide();
        }
    }

    function submitFormHandler(e) {
        e.preventDefault();

        var query = $(this).serialize();
        var url = $(this).attr('action');
        $('body').append(t('<script src="', url, '?', query, '"></script>'));
    }

    function retrieveBankHolidays() {
    }

    $('#callbackcalldate').change(dayChangedHandler);
    $('#callbacklanguage').change(languageChangedHandler);
    
    populateDatesThisWeek();
    retrieveBankHolidays();
    
    $('#callmeback').submit(submitFormHandler);

    // All this is one giant ugly hack.

    window.showComplete = function(who, how, weekday, time) {
        $('#formdiv').hide();
        $('#maindiv').append(t("<div>Thank you. One of our advisers will contact you shortly on ", how, " on ", weekday, " at around ", time, "</div>."));
    };

    window.onerror = function() {
        $('#formdiv').hide();
        $('#maindiv').append(t("<div>An error has occurred. Please try again later.</div>"));
        return false;
    };
});
