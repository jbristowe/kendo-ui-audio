$(function() {

	const FFTSIZE = 256;
	const SMOOTHING_TIME = 0.1;

	var analyser,
		audioBuffer,
		audioElement,
		$audioElement,
		audioContext = new (window.AudioContext || window.webkitAudioContext)(),
		audioSource,
		chart,
		chartDropDownList,
		isPlaying,
		processor,
		frequencyData,
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
			dataSource: {
				data: new Array(FFTSIZE / 2)
			},
			legend: { visible: false },
			seriesDefaults: {
				border: { width: 0 },
				labels: { visible: false },
				markers: { visible: false },
				overlay: { gradient: null },
				type: "column"
			},
			series: [{ field: "values" }],
			transitions: false,
			valueAxis: {
				majorGridLines: { visible: false },
				max: 250,
				visible: false
			}
		}).data("kendoChart");

		$audioElement = $("#sound");
		audioElement = $audioElement.get(0);
	},

	initAudio = function() {
		$audioElement
			.on("error onabort", function(e) {
				stop();
			})
			.on("play pause", function(e) {
				switch(e.type) {
					case "play":
						play();
						break;
					case "pause":
						pause();
						break;
				}
			});

		audioSource = audioContext.createMediaElementSource(audioElement);

		analyser = audioContext.createAnalyser();
		analyser.fftSize = FFTSIZE;
		processor = audioContext.createJavaScriptNode(FFTSIZE, 1, 1);

		audioSource.connect(analyser);
		analyser.connect(audioContext.destination);
		processor.connect(audioContext.destination);

		processor.onaudioprocess = processAudio;

		frequencyData = new Uint8Array(analyser.frequencyBinCount);
		timeDomainData = new Uint8Array(analyser.frequencyBinCount);
	},

	play = function() {
		if (audioElement) audioElement.play();
		else audioSource.noteOn(0);

		isPlaying = true;
	},

	processAudio = function() {
		if (isPlaying) {
			analyser.getByteFrequencyData(frequencyData);
			analyser.getByteTimeDomainData(timeDomainData);
			chart.dataSource.data(Array.apply([], frequencyData));
		}
	},

	stop = function() {
		isPlaying = false;

		try { audioSource.noteOff(0); } catch(e) {}
		try {
			audioSource.disconnect();
			processor.disconnect();
			analyser.disconnect();
		} catch(e) {}
		audioContext = null;
	},

	pause = function() {
		isPlaying = false;

		if (audioElement) audioElement.pause();
		else stop();
	};

	$(document).ready(function() {
		init();
		initAudio();

		window.AudioContext = (window.AudioContext || window.webkitAudioContext || null);
		if (!AudioContext) {
			throw new Error("AudioContext not supported!");
		}
	});
});