var aFullLife = (function() {
  var game = {};
  
  game.levels = [
    {
      name: 'Normal',
      description: 'A well-balanced life',
      innerDiameter: 1, // Percentage of outer diameter
      fillers: [
        { name: 'Work', value: 0.24, selected: false },
        { name: 'Sleep', value: 0.33, selected: false },
        { name: 'Meals', value: 0.13, selected: false },
        { name: 'Social life', value: 0.20, selected: false },
        { name: 'Hobbies', value: 0.10, selected: false }
      ]
    },
    {
      name: 'Clinical Depression',
      description: 'You have been diagnosed with clinical depression.',
      innerDiameter: 0.7, // Percentage of outer diameter
      fillers: [
        { name: 'Feeling good about the work you do', value: 0.24, selected: false },
        { name: 'Sleeping well', value: 0.33, selected: false },
        { name: 'Enjoying meals', value: 0.13, selected: false },
        { name: 'Looking happy in your social life', value: 0.20, selected: false },
        { name: 'Maintaining interest in hobbies', value: 0.10, selected: false }
      ]
    },
    {
      name: 'Generalized Anxiety Disorder',
      description: 'You have been diagnosed with an anxiety disorder.',
      innerDiameter: 0.8, // Percentage of outer diameter
      fillers: [
        { name: 'Obsessing over accomplishing tasks well', value: 0.44, selected: false },
        { name: 'Sleeping through the whole night', value: 0.33, selected: false },
        { name: 'Not getting addicted to benzodiazapines', value: 0.13, selected: false },
        { name: 'Being able to be around others comfortably', value: 0.20, selected: false },
        { name: 'Worrying whether your hobbies reflect well on you', value: 0.10, selected: false }
      ]
    },
    {
      name: 'Homosexuality',
      description: 'You realize at an early age that you identify as homosexual',
      innerDiameter: 0.9,
      fillers: [
        { name: 'Feeling comfortable with your sexuality', value: 0.20, selected: false},
        { name: 'The acceptance of your parents', value: 0.30, selected: false },
        { name: 'The respect of your coworkers/peers', value: 0.30, selected: false },
        { name: 'Getting married', value: 0.60, selected: false },
        { name: 'Expectation of personal safety', value: 0.40, selected: false}
      ]
    },
    {
      name: 'Gender Dysphoria',
      description: 'You realize early on that you do not feel comfortable with' +
        ' your birth sex.',
      innerDiameter: 0.9,
      fillers: [
        { name: 'Passing', value: 0.75, selected: false },
        { name: 'Affording Hormone Replacement Therapy', value: 0.4, selected: false },
        { name: 'Deciding on surgery', value: 0.3, selected: false },
        { name: 'Explaining the difference between gender and sex', value: 0.15, selected: false },
        { name: 'Living with misgendering and disbelief', value: 0.4, selected: false }
      ],
    },
  ];

  game.currentLevel = window.location.hash ? 
    parseInt(window.location.hash.split('#')[1], 10) : 0;
  game.instructionsSeen = false;
  game.healthNoteSeen = false;
  game.identityNoteSeen = false;

  game.initialize = function() {
    this.el = document.getElementById('game');
    this.dimensions = [
      this.el.clientWidth - 20,
      document.documentElement.clientHeight - 240
    ];
    this.vis = d3.select('#game')
      .append('svg')
      .attr({
        width: Math.max(800, this.dimensions[0]) + 20,
        height: Math.max(600, this.dimensions[1]) + 20
      })
      .append('g')
      .attr('transform', 'translate(10,10)');

    // Panels
    this.fillerPanel = this.vis.append('g')
      .attr({
        'class': 'filler',
        width: this.dimensions[0] - (this.dimensions[0] * 0.618),
        height: this.dimensions[1] - 10,
        transform: 'translate(0,10)'
      });
    this.lifePanel = this.vis.append('g')
      .attr({
        'class': 'life',
        width: this.dimensions[0] * 0.618,
        height: this.dimensions[1] - 10,
        transform: 'translate(' + 
          (this.dimensions[0] - (this.dimensions[0] * 0.618)) + ',10)'
      });
    this.levelPanel = this.vis.append('g')
      .attr({
        'class': 'level',
        width: 100,
        height: 60,
        transform: 'translate(' + (this.dimensions[0] - 100) + ',10)'
      });

    // Headers
    this.fillerPanel.append('text')
      .text('Fill Your Life With:')
      .attr({
        'class': 'header',
        x: 0,
        y: 26
      });
    this.lifePanel.append('text')
      .text('Your Life: ')
      .attr({
        'class': 'header',
        x: 0,
        y: 26
      }).append('tspan')
      .attr('class', 'levelTitle');
    this.lifePanel.append('text')
      .attr({
        'class': 'levelDescription',
        x: 0,
        y: 54
      });
    this.levelPanel.append('text')
      .text('Level ')
      .attr({
        'class': 'header',
        x: 0,
        y: 26
      }).append('tspan')
      .attr('class', 'currLevel');
    this.levelPanel.append('text')
      .text('<')
      .attr({
        'class': 'header prevLevel clickable',
        x: 0,
        y: 54
      });
    this.levelPanel.append('text')
      .text('>')
      .attr({
        'class': 'header nextLevel clickable',
        x: 87,
        y: 54
      });

    this.draw();
  };

  game.draw = function() {
    var self = this;
    var level = this.levels[this.currentLevel];
    window.location.hash = this.currentLevel;

    // Draw the life circle.
    // First, calculate points and radii.
    var centerPoint = [
        this.lifePanel.attr('width') / 2,
        this.lifePanel.attr('height') / 2 + 26
      ];
    var outerRadius = Math.min(
        this.lifePanel.attr('width') / 2,
        this.lifePanel.attr('height') / 2 - 26) * 0.7;
    var strokeWidth = outerRadius - outerRadius * level.innerDiameter + 1;
    var innerRadius = outerRadius - strokeWidth;

    // Attach these to the object for use in other scopes.
    this.lifeCircleProperties = {
      outerRadius: outerRadius,
      strokeWidth: strokeWidth,
      innerRadius: innerRadius,
      centerPoint: centerPoint
    };

    this.lifePanel.select('.levelTitle')
      .text(level.name);
    this.lifePanel.select('.levelDescription')
      .text(level.description);

    this.life = this.lifePanel.append('circle')
      .attr({
        'class': 'lifeCircle clearable',
        cx: centerPoint[0],
        cy: centerPoint[1],
        r: outerRadius - (strokeWidth / 2),
        'stroke-width': strokeWidth
      });

    // Draw the fillers
    var fillerHeight = (this.fillerPanel.attr('height') - 26) / 
      level.fillers.length * 0.9;
    var fillerItem = this.fillerPanel.selectAll('.fillerItem')
      .data(level.fillers)
      .enter()
      .append('g')
      .attr('class', 'fillerItem clearable clickable')
      .attr('transform', function(d, i) {
        return 'translate(' +  [10, 28 + fillerHeight * i] + ')';
      });

    fillerItem.append('text')
      .text(function(d) { return d.name; })
      .attr({
        x: fillerHeight,
        y: fillerHeight / 2,
        'dominant-baseline': 'middle'
      });

    fillerItem.append('circle')
      .attr({
        'class': 'fillerCircle',
        cx: fillerHeight / 2,
        cy: fillerHeight / 2,
        strokeWidth: 1
      })
      .attr('r', function(d) {
        return (d.value * fillerHeight) / 2;
      });

    fillerItem.append('rect')
      .attr({
        x: 0,
        y: 0,
        width: this.fillerPanel.attr('width') - 20,
        height: fillerHeight
      })
      .on('click', function(d) {
        self.step(this, d);
      });

    // Draw the current value indicator
    this.currentValue = 0;
    this.currentValueIndicator = this.lifePanel.append('g')
      .attr('class', 'currentValueIndicator clearable');
    this.currentValueIndicator.append('circle')
      .attr({
        cx: centerPoint[0],
        cy: centerPoint[1],
        r: 0,
        'stroke-width': 1
      });
    this.currentValueIndicator.append('text')
      .text('0% full')
      .attr({
        x: centerPoint[0] + 10,
        y: centerPoint[1],
        'dominant-baseline': 'middle'
      });

    // Draw the level selection controls.
    this.levelPanel.select('.currLevel').text(this.currentLevel);
    if (this.currentLevel === 0) {
      this.levelPanel.select('.prevLevel')
        .style('display', 'none');
    } else {
      this.levelPanel.select('.prevLevel')
        .style('display', 'block')
        .on('click', function() {
          self.currentLevel--;
          self.clear();
          self.draw();
        });
    }
    if (this.currentLevel === this.levels.length - 1) {
      this.levelPanel.select('.nextLevel')
        .style('display', 'none');
    } else {
      this.levelPanel.select('.nextLevel')
        .style('display', 'block')
        .on('click', function() {
          self.currentLevel++;
          self.clear();
          self.draw();
        });
    }
  };

  game.step = function(el, datum) {
    var mustTransition = false;
    if (datum.selected) {
      d3.select(el)
        .style('opacity', 0.0);
      this.currentValue -= datum.value;
      mustTransition = true;
      datum.selected = false;
    } else {
      if (Math.floor((datum.value + this.currentValue) * 100) > 
          this.levels[this.currentLevel].innerDiameter * 100) {
        this.tooFullError();
        return;
      } else {
        d3.select(el)
          .style('opacity', 0.75);
        this.currentValue += datum.value;
        mustTransition = true;
        datum.selected = true;
      }
    }

    if (mustTransition) {
      this.currentValueIndicator.select('circle')
        .transition()
        .attr('r', this.currentValue * 
          this.lifeCircleProperties.outerRadius)
        .duration(1000);
      this.currentValueIndicator.select('text')
        .transition()
        .attr('x', this.lifeCircleProperties.centerPoint[0] + 10 +
          (this.currentValue * this.lifeCircleProperties.outerRadius))
        .duration(1000);
      this.currentValueIndicator.select('text')
        .text(Math.floor(this.currentValue * 100) + '% full')
    }
  };

  game.tooFullError = function() {
    var error = this.vis.append('g')
      .attr('class', 'clearable');
    error.append('rect')
      .attr({
        'class': 'modalError',
        x: this.dimensions[0] / 2 - 200,
        y: this.dimensions[1] / 2 - 50,
        rx: 20,
        ry: 20,
        width: 400,
        height: 100
      });
    error.append('text')
      .text('You cannot fit that in your life!')
      .attr({
        'class': 'header',
        x: this.dimensions[0] / 2,
        y: this.dimensions[1] / 2,
        'text-anchor': 'middle',
        'dominant-baseline': 'middle'
      });
    error.transition()
      .style('opacity', 0)
      .duration(2500)
      .remove();
  };

  game.clear = function() {
    this.vis.selectAll('.clearable')
      .remove();
  };

  return game;
})()
