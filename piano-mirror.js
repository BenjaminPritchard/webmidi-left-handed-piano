//
// This is the webMidi version of the Kundalini Piano Mirror
//		https://github.com/BenjaminPritchard/webmidi-left-handed-piano
//
// See the github page for this project for more information:
//		https://github.com/BenjaminPritchard/webmidi-left-handed-piano
//
// Usage:
//		statusPrompt = document.getElementById("xxx");
//		midi_input_dropdown = document.getElementById("xxx");
//		midi_output_dropdown = document.getElementById("xxx");
//		InitMidi();
// 
// Update CurrentTranpositionMode whenever you want
//
// This code needs updated to work correctly if there is more than one MIDI input / output
//
// Benjamin Pritchard / Kundalini Software
// 1.0	12-July-2020	initial release
//

var midiOut;

const NO_TRANSPOSITION 	= 0; 
const LEFT_ASCENDING	= 1; 
const RIGHT_DESCENDING	= 2; 
const MIRROR_IMAGE		= 3;

var CurrentTranpositionMode = NO_TRANSPOSITION;

var statusPrompt;
var midi_input_dropdown;
var midi_output_dropdown;

function sendMidiMessage(status, data1, data2) {
   
  const device = midiOut[midi_output_dropdown.selectedIndex];
  const msgOn = [status, data1, data2];
  
  device.send(msgOn); 
     
}

// takes an input node, and maps it according to current transposition mode
function TransformNote(Note, transpositionMode) {

	var retval = Note;
	var offset;

	switch (CurrentTranpositionMode) {

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
	data1 = TransformNote(data1);
    var data2 = (message.data.length > 2) ? message.data[2] : 0; 

	sendMidiMessage(status, data1, data2)
}


// called after we are granted access to webMIDI 
function onMIDISuccess(midiAccess) {
   
    midiOut = [];

	// just add all the midi input devices to our dropdown
	midi_inputs = midi_input_dropdown;
	for (var input of midiAccess.inputs.values()) {
		var option = document.createElement("option");
  		option.text = input.name;
  		midi_inputs.add(option);		

        input.onmidimessage = processMIDIMessage;
    }

	// add all midi output devices to our dropdown
	midi_outputs = midi_output_dropdown;
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


function onMIDIFailure() {
	statusPrompt.innerText = 'Could not access your MIDI devices.';
}

function InitMidi() 
{
	if (navigator.requestMIDIAccess) {
		statusPrompt.innerText = 'This browser supports WebMIDI!';
	} else {
		statusPrompt.innerText = 'WebMIDI is not supported in this browser.';
	}

	navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
	
}


