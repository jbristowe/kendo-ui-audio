jQuery(document).ready(function($) {

	"use strict";

	// requestAnim shim layer by Paul Irish
    if (!window.requestAnimationFrame) {
		window.requestAnimationFrame = ( function() {
	 		return window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			window.oRequestAnimationFrame ||
			window.msRequestAnimationFrame ||
			function( /* function FrameRequestCallback */ callback, /* DOMElement Element */ element ) {
				window.setTimeout( callback, 1000 / 60 );
			};
		} )();
	};

	var analyser,
		audioElement,
		$audioElement,
		audioContext,
		audioSource,
		chart,
		chartDropDownList,
		fftSize = 256,
		frequencyData,
		smoothingTimeConstant = 0.3,
		timeDomainData,

	init = function() {
		chartDropDownList = $("#chartDropDownList").kendoDropDownList({
			select: function(e) {
				var dataItem = this.dataItem(e.item.index());
				chart.options.series[0].type = dataItem.value;
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
			transitions: false,
			valueAxis: {
				majorGridLines: { visible: false },
				max: 250,
				visible: false
			}
		}).data("kendoChart");

		audioContext = new (window.AudioContext || window.webkitAudioContext)();

		$audioElement = $("#sound");
		audioElement = $audioElement.get(0);

		audioSource = audioContext.createMediaElementSource(audioElement);
		analyser = audioContext.createAnalyser();
		analyser.fftSize = fftSize;
		analyser.smoothingTimeConstant = smoothingTimeConstant;

		audioSource.connect(analyser);
		analyser.connect(audioContext.destination);

		frequencyData = new Uint8Array(analyser.frequencyBinCount);
		timeDomainData = new Uint8Array(analyser.frequencyBinCount);
	},

	draw = function() {
		window.requestAnimationFrame(draw);
		analyser.getByteFrequencyData(frequencyData);
		analyser.getByteTimeDomainData(timeDomainData);

		chart.options.series[0].data = Array.apply([], frequencyData);
		chart.options.series[1].data = Array.apply([], timeDomainData);

		chart.redraw();
	};

	init();
	draw();
});