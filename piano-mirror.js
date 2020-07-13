//
// This is the webMidi version of the Kundalini Piano Mirror
//		https://www.kundalinisoftware.com/kundalini-piano-mirror/
//
// See the github page for this project for more information:
//		https://github.com/BenjaminPritchard
//
// Benjamin Pritchard / Kundalini Software
//
// 1.0	12-July-2020	initial release
//

var midiOut;

const NO_TRANSPOSITION 	= 0; 
const LEFT_ASCENDING	= 1; 
const RIGHT_DESCENDING	= 2; 
const MIRROR_IMAGE		= 3;

function sendMidiMessage(status, data1, data2) {
   
  const device = midiOut[midi_outputs.selectedIndex];
  const msgOn = [status, data1, data2];
  
  device.send(msgOn); 
     
}

// takes an input node, and maps it according to current transposition mode
function TransformNote(Note, transpositionMode) {

	var retval = Note;
	var offset;

	switch (transpositionMode) {

		case NO_TRANSPOSITION:
			// do nothing, just return original note!
			retval = Note; 
			break;
			
		// make left hand ascend
		case LEFT_ASCENDING:
			if (Note < 62) {
				offset = (62 - Note);
				retval = 62 + offset;
			} // else do nothing;
			break;
			
		// make right hand descend
		case RIGHT_DESCENDING:
			if (Note > 62) {
				offset = (Note - 62);
				retval = 62 - offset;
			} // else do nothing;
			break;

		// completely reverse the keyboard
		case MIRROR_IMAGE:
			if (Note == 62) {
				// do nothing
			}
			else if (Note < 62) {
				offset = (62 - Note);
				retval = 62 + offset;
			}
			else if (Note > 62) {
				offset = (Note - 62);
				retval = 62 - offset;
			}
			break;
		}

	return retval;
}

// this function is called whenever we get an incoming MIDI messgae
// we just echo it back out, after transforming it 
// according to our tranposition mode
function processMIDIMessage(message) {

    var status = message.data[0];

	// not sure what this is??
	if (status == 254) return;

	var data1 = message.data[1];
	data1 = TransformNote(data1, mode.selectedIndex);
    var data2 = (message.data.length > 2) ? message.data[2] : 0; 

	sendMidiMessage(status, data1, data2)
}


// called after we are granted access to webMIDI 
function onMIDISuccess(midiAccess) {
    console.log(midiAccess);

    midiOut = [];

	// just add all the midi input devices to our dropdown
	midi_inputs = document.getElementById("midi_inputs");
	for (var input of midiAccess.inputs.values()) {
		var option = document.createElement("option");
  		option.text = input.name;
  		midi_inputs.add(option);		

        input.onmidimessage = processMIDIMessage;
    }

	// add all midi output devices to our dropdown
	midi_outputs = document.getElementById("midi_outputs");
	for (var output of midiAccess.outputs.values()) {
        
		// add to dropdown
		var option = document.createElement("option");
  		option.text = output.name;
  		midi_outputs.add(option);

		// and save a reference to each output device to our global variable, 
		// so we can get at it later
		midiOut.push(output);
    }

}

// probably should let the user know somehow??
function onMIDIFailure() {
	document.getElementById("status").innerText = 'Could not access your MIDI devices.';
}

function InitSystem() 
{
	if (navigator.requestMIDIAccess) {
		document.getElementById("status").innerText = 'This browser supports WebMIDI!';
	} else {
		document.getElementById("status").innerText = 'WebMIDI is not supported in this browser.';
	}

	navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
	
}

function showAbout() {
	document.getElementById("about").style.display = 'block';
	document.getElementById("instructions").style.display = 'none';
	document.getElementById("Main").style.display = 'none';
}


function showInstructions() {
	document.getElementById("about").style.display = 'none';
	document.getElementById("instructions").style.display = 'block';
	document.getElementById("Main").style.display = 'none';
}


function showMain() {
	document.getElementById("about").style.display = 'none';
	document.getElementById("instructions").style.display = 'none';
	document.getElementById("Main").style.display = 'block';
}


function DoModeChange() {
	// for now we don't do anything
	// just the .selectedIndex of the dropdown will be used in 	
}

