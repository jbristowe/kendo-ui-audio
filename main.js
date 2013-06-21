$(function() {

	"use strict";

	var analyser,
		audioBuffer,
		audioElement,
		$audioElement,
		audioContext,
		audioSource,
		chart,
		chartDropDownList,
		processor,
		fftSize = 256,
		frequencyData,
		smoothingTimeConstant = 0.3,
		themeDropDownList,
		timeDomainData,
		url,

	init = function() {
		chartDropDownList = $("#chartDropDownList").kendoDropDownList({
			select: function(e) {
				var dataItem = this.dataItem(e.item.index());
				chart.options.series[0].type = dataItem.value;
				chart.refresh();
			}
		});

		chart = $("#chart").kendoChart({
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

		window.AudioContext = window.AudioContext||window.webkitAudioContext;
		audioContext = new window.AudioContext;

		$audioElement = $("#sound");
		audioElement = $audioElement.get(0);
	},

	initAudio = function() {
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
		analyser.getByteFrequencyData(frequencyData);
		analyser.getByteTimeDomainData(timeDomainData);

		chart.options.series[0].data = Array.apply([], frequencyData);
		chart.options.series[1].data = Array.apply([], timeDomainData);

		chart.redraw();

		requestAnimationFrame(draw);
	}

	$(document).ready(function() {
		init();
		initAudio();
		draw();
	});
});