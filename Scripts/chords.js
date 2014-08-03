var app = angular.module('chords-app', ['underscore', 'ui.bootstrap']);
var underscore = angular.module('underscore', []);
underscore.factory('_', function ()
{
    return window._; // assumes underscore has already been loaded on the page
});

app.factory('dataFactory', function ($http)
{
    return {
        get: function (url)
        {
            return $http.get(url).then(function (resp)
            {
                var c = resp.data.chords;
                for (var i = 0; i < c.length; i++)
                {
                    for (var j = 0; j < c[i].finger.length; j++)
                    {
                        c[i].finger[j] = parseInt(c[i].finger[j], 10);
                    }
                }

                return resp.data.chords; // success callback returns this
            });
        }
    };
});

app.filter('parseMute', function ()
{
    return function (i)
    {
        if (i === -2)
        {
            return 'x';
        }
        return i;
    };
});

app.controller('ChordsCtrl', function ($scope, $http, _, dataFactory)
{
    dataFactory.get('./chords.json').then(function (data)
    {
        $scope.chords = data;
        $scope.filteredChords = $scope.chords;
    });

    $scope.getTimes = function (n)
    {
        return new Array(n);
    }
    $scope.tunings =
    [
        { 'n': 'Standard', 'v': [0, 0, 0, 0, 0, 0] },
        { 'n': 'Eb', 'v': [1, 1, 1, 1, 1, 1] },
        { 'n': 'D', 'v': [2, 2, 2, 2, 2, 2] },
        { 'n': 'Drop D', 'v': [0, 0, 0, 0, 0, 2] },
        { 'n': 'Drop Db', 'v': [1, 1, 1, 1, 1, 3] },
        { 'n': 'Drop C', 'v': [2, 2, 2, 2, 2, 4] },
        { 'n': 'Drop B', 'v': [3, 3, 3, 3, 3, 5] },
        { 'n': 'Drop Bb', 'v': [4, 4, 4, 4, 4, 6] },
        { 'n': 'Drop A', 'v': [5, 5, 5, 5, 5, 7] },
        { 'n': 'Drop Ab', 'v': [5, 5, 5, 5, 5, 7] },
        { 'n': 'Drop G', 'v': [6, 6, 6, 6, 6, 8] },
        { 'n': 'D standard', 'v': [2, 2, 2, 2, 2, 7] },
        { 'n': 'Open A', 'v': [0, 1, 2, 1, 0, 0] },
        { 'n': 'Open A (slide)', 'v': [0, -2, -2, -2, 0, 0] },
        { 'n': 'Open B', 'v': [1, 0, 1, 3, 3, 5] },
        { 'n': 'Open C', 'v': [0, -1, 0, 2, 2, 4] },
        { 'n': 'Open D', 'v': [2, 2, 1, 0, 2, 2] },
        { 'n': 'Open E', 'v': [0, 0, -1, -2, -2, 0] },
        { 'n': 'Open F', 'v': [4, 2, 2, 2, 4, 4] },
        { 'n': 'Open G', 'v': [2, 0, 0, 0, 2, 2] },
        { 'n': 'Dad-Gad', 'v': [2, 2, 0, 0, 0, 2] },
        { 'n': 'Dad-Dad', 'v': [2, 2, 5, 0, 0, 2] }
    ]

    $scope.setCell = function (f, s)
    {
        $scope.active = true;
        $scope.validNotes = [[], [], [], [], [], []]

        if ($scope.selectedNotes[s] != -1)
        {
            $scope.reset();
        }

        $scope.selectedNotes[s] = f;

        $scope.filteredChords = _.filter($scope.filteredChords, function (c)
        {
            return parseInt(c.finger[$scope.stringCount - s - 1], 10) === f;
        });

        for (var i = 0; i < $scope.filteredChords.length; i++)
        {
            for (var j = 0; j < $scope.filteredChords[i].finger.length; j++)
            {
                var n = parseInt($scope.filteredChords[i].finger[j], 10);

                if (_.indexOf($scope.validNotes[$scope.stringCount - j - 1], n) === -1)
                {
                    $scope.validNotes[$scope.stringCount - j - 1].push(n);
                }
            }
        }
        $scope.checkValidNotesLength();
    }
    $scope.retune = function (t)
    {
        $scope.prevTuning = $scope.currTuning;
        $scope.currTuning = t;

        for (var i = 0; i < $scope.validNotes.length; i++)
        {

            for (var j = 0; j < $scope.validNotes[i].length; j++)
            {
                var f = parseInt($scope.validNotes[i][j]);

                if (f >= 0)
                {
                    var g = f - $scope.prevTuning.v[i] + $scope.currTuning.v[i];

                    $scope.validNotes[i][j] = g;
                    $scope.selectedNotes[i] = g;

                    $scope.filteredChords[0].finger[$scope.stringCount - i - 1] = g;
                }
            }
        }
    }
    $scope.setChord = function (c)
    {
        $scope.active = true;
        $scope.validNotes = [[], [], [], [], [], []];
        $scope.filteredChords = [c];
        for (var i = 0; i < c.finger.length; i++)
        {
            var f = parseInt(c.finger[i], 10);
            $scope.selectedNotes[i] = f;
            $scope.validNotes[i][0] = f;
        }
        $scope.selectedNotes.reverse();
        $scope.validNotes.reverse();
        $scope.checkBarre();
        document.body.className = 'resulted';
    }
    // is the note valid, based on the previous selections? return true sets the appropriate class
    $scope.isValid = function (f, s)
    {
        if ($scope.selectedNotes.length > 0)
        {
            if (_.indexOf($scope.validNotes[s], f) != -1)
            {
                return true
            }

            return false;
        }
        return false;
    }
    // is the note selected? return true sets the appropriate class
    $scope.isSelected = function (f, s)
    {
        if ($scope.selectedNotes.length > 0)
        {
            for (var i = 0; i < $scope.selectedNotes.length; i++)
            {
                if ($scope.selectedNotes[i] === f && i === s)
                {
                    return true
                }
            }
            return false;
        }
        return false;
    }
    // is the string muted? return true sets the appropriate class
    $scope.isMuted = function (s)
    {
        if ($scope.selectedNotes.length > 0)
        {
            if ($scope.selectedNotes[s] === -2)
            {
                return true;
            }
            return false;
        }
    }
    // is the string open? return true sets the appropriate class
    $scope.isOpen = function (s)
    {
        if ($scope.selectedNotes.length > 0)
        {
            if ($scope.selectedNotes[s] === 0)
            {
                return true;
            }
            return false;
        }
    }

    // is the chord a barre? return true sets the appropriate class
    $scope.isBarre = function (f, s)
    {
        if ($scope.barre === true)
        {
            var barreFret = $scope.selectedNotes[0];
            if (f === barreFret)
            {
                return true;
            }
        }
        return false;
    }

    $scope.checkBarre = function ()
    {
        var min = $scope.selectedNotes[0];
        if (min === $scope.selectedNotes[$scope.selectedNotes.length - 1] &&
            min <= $scope.selectedNotes[1] &&
            min <= $scope.selectedNotes[2] &&
            min <= $scope.selectedNotes[3] &&
            min <= $scope.selectedNotes[4] &&
            min <= $scope.selectedNotes[5])
        {
            $scope.barre = true;
        }
    }

    $scope.checkValidNotesLength = function ()
    {
        var x = 0;
        for (var i = 0; i < $scope.validNotes.length; i++)
        {
            if ($scope.validNotes[i].length === 1)
            {
                $scope.isSelected($scope.validNotes[i][0], i)
                x++;
            }
        }
        if (x === $scope.selectedNotes.length)
        {
            for (var i = 0; i < $scope.validNotes.length; i++)
            {
                $scope.selectedNotes[i] = $scope.validNotes[i][0]
            }
            $scope.checkBarre();
            document.body.className = 'resulted';
        }
    }
    /* modifies typeahed for start char rather than any instance of */
    $scope.startsWith = function (state, viewValue)
    {
        return state.substr(0, viewValue.length).toLowerCase() == viewValue.toLowerCase();
    }
    $scope.reset = function ()
    {
        $scope.active = false;
        $scope.barre = false;
        document.body.className = '';
        $scope.stringCount = 6;
        $scope.selectedChord = null;
        $scope.currTuning = $scope.tunings[0];
        $scope.prevTuning = $scope.tunings[0];
        $scope.tuning = $scope.tunings[0];
        $scope.validNotes = [[], [], [], [], [], []];
        $scope.selectedNotes = [-1, -1, -1, -1, -1, -1];
        $scope.filteredChords = $scope.chords;
    }
    $scope.reset();
});