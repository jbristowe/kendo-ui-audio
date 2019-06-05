jQuery(document).ready(function($) {

	"use strict";

	var analyser,
		audioElement,
		$audioElement,
		audioContext,
		audioSource,
		chart,
		fftSize = 512,
		frequencyData,
		smoothingTimeConstant = 0.3,
    timeDomainData,

	init = function() {
		$("#frequencyChartDropDownList").kendoDropDownList({
			select: function(e) {
				var dataItem = this.dataItem(e.item.index());
				chart.options.series[0].type = dataItem.value;
				chart.refresh();
			}
		});

		$("#timeDomainChartDropDownList").kendoDropDownList({
			select: function(e) {
				var dataItem = this.dataItem(e.item.index());
				chart.options.series[1].type = dataItem.value;
				chart.refresh();
			}
		});

		chart = $("#chart").kendoChart({
		  renderAs: "canvas",
			categoryAxis: {
				majorGridLines: { visible: false },
				visible: false
			},
			legend: { visible: false },
			seriesDefaults: {
				border: { width: 0 },
				labels: { visible: false },
				line: {
					width: 2
				},
				markers: { visible: false },
				overlay: { gradient: null },
				type: "column"
			},
			series: [
				{ field: "frequencies" },
				{ field: "timeDomains", type: "line" }
			],
			theme: "bootstrap",
			transitions: false,
			valueAxis: {
				majorGridLines: { visible: false },
				max: 250,
				visible: false
			}
		}).data("kendoChart");

		$audioElement = $("#sound");
		audioElement = $audioElement.get(0);

    audioElement.onplay = function() {
      if (!audioContext) {
        audioContext = new window.AudioContext();
  
        audioSource = audioContext.createMediaElementSource(audioElement);
        analyser = audioContext.createAnalyser();
        analyser.fftSize = fftSize;
        analyser.smoothingTimeConstant = smoothingTimeConstant;
    
        audioSource.connect(analyser);
        analyser.connect(audioContext.destination);
    
        frequencyData = new Uint8Array(analyser.frequencyBinCount);
        timeDomainData = new Uint8Array(analyser.frequencyBinCount);  
  
        draw();
      }
    };
	},

	draw = function() {
    analyser.getByteFrequencyData(frequencyData);
    analyser.getByteTimeDomainData(timeDomainData);

    chart.options.series[0].data = Array.apply([], frequencyData);
    chart.options.series[1].data = Array.apply([], timeDomainData);  
    chart.redraw();  

    kendo.animationFrame(draw);
	};

	init();
});