import { useState, useEffect } from 'react'
import '../instruments.css'
import Button from '../components/Button.jsx'
import Progress from '../components/Progress.jsx'
import Key from '../components/Key.jsx'
import audio from '../assets/sounds/C3.wav';

function Sampler() {
    const audioUrl = audio;
    const [audioContext, setAudioContext] = useState(null);
    const [audioBuffer, setAudioBuffer] = useState(null);

    const [keys, setKeys] = useState([]);
    const keysSharp = [];
    const [rerender, setRerender] = useState(false);
    const [octave, setOctave] = useState(1);
    const [octaveUp, setOctaveUp] = useState(false);
    const [octaveDown, setOctaveDown] = useState(false);
    const [playingNotes, setPlayingNotes] = useState([]);
    const [playingNotedown, setPlayingNotedown] = useState(false);

    const roundNotesNr = [1,3,5,6,8,10,12,13,15,17,18,20,22,24,25,27,29,30,32,34,36];
    const sharpNotesNr = [2,4,7,9,11,14,16,19,21,23,26,28,31,33,35];
    const keyboardKeys = ['a', 'w', 's', 'e', 'd', 'f', 't', 'g', 'y', 'h', 'u', 'j'];

    function translateKeyToNumber(key, oct) {
        return (keyboardKeys.indexOf(key) + (oct * 12) + 1)
    }

    function handleKeyDown(event) {
        if (event.key === 'z') {
            setOctaveDown(true);
            setOctave((prevOctave) => (prevOctave == 0 ? 0 : prevOctave - 1))
        } else if (event.key === 'x') {
            setOctaveUp(true);
            setOctave((prevOctave) => (prevOctave == 2 ? 2 : prevOctave + 1))
        } else if ((roundNotesNr.includes(translateKeyToNumber(event.key, octave)) || sharpNotesNr.includes(translateKeyToNumber(event.key, octave))) && !playingNotes.includes(translateKeyToNumber(event.key, octave))) {
            const pN = playingNotes;
            pN.push(translateKeyToNumber(event.key, octave));
            setPlayingNotes(p => pN);
            setPlayingNotedown(true);
            setRerender(r => !r);
            playAudio(event, octave);
        }
    }
    function handleKeyUp(event) {
        if (event.key === 'z') {
            setOctaveDown(false);
        } else if (event.key === 'x') {
            setOctaveUp(false);
        }
        else if ((roundNotesNr.includes(translateKeyToNumber(event.key, octave)) || sharpNotesNr.includes(translateKeyToNumber(event.key, octave))) && playingNotes.includes(translateKeyToNumber(event.key, octave))) {
            const pN = playingNotes;
            const pN_filtered = pN.filter(n => n !== translateKeyToNumber(event.key, octave));
            setPlayingNotes(p => pN_filtered);
            if (pN_filtered.length == 0) {
                setPlayingNotedown(false);
            }
            setRerender(r => !r);
        }
    }

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
            return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [handleKeyUp, handleKeyDown]);

    useEffect(() => {
        const context = new AudioContext();
        setAudioContext(c => (context));
        loadAudio(audioUrl, context);
        return () => {
            context.close();
        }
    }, []);

    async function loadAudio(url, audioContext) {
        try {
          const response = await fetch(url);
          const arrayBuffer = await response.arrayBuffer();
          const audioBuff = await audioContext.decodeAudioData(arrayBuffer);
          setAudioBuffer(audioBuff);
        } catch (error) {
          console.error('Error loading audio:', error);
          return null;
        }
      }

    function playAudio(event, octave) {
        if (audioContext && audioBuffer) {
            const source = audioContext.createBufferSource();
            source.buffer = audioBuffer;
            const noteNumber = translateKeyToNumber(event.key, octave);
            const detune = ((noteNumber - 12) * 100);
            source.detune.value = detune;
            const gainNode = audioContext.createGain();
            gainNode.gain.value = 0.5;
            source.connect(gainNode).connect(audioContext.destination);
            source.start();
          }
      }

    return (
        <>
            <div className="sampler panel-light">
                <h1>Sampler</h1>
                <div className="sampler-top-panel">
                    <Button width={160} height={40}>Upload sample</Button>
                    <div className="screen"></div>
                    <div className="octave-panel">
                        <div><Button active={octaveDown} width={40} height={40}>z</Button> oct ▼</div>
                        <div><Button active={octaveUp} width={40} height={40}>x</Button> oct ▲</div>
                    </div>
                </div>
                <div className="sampler-bottom-panel">
                    <div className="progress-panel">
                        <Progress type={octave == 0 ? "full" : "empty"} height={4} width={'33%'}></Progress>
                        <Progress type={octave == 1 ? "full" : "empty"} height={4} width={'33%'}></Progress>
                        <Progress type={octave == 2 ? "full" : "empty"} height={4} width={'33%'}></Progress>
                    </div>
                    <div className="keyboard">
                        <div className="keys">
                            {[1,2,3].map((i) => {
                                const sharpNotesBaseNr = (5*(i-1));
                                return(
                                    <>
                                        <Key key={sharpNotesNr[sharpNotesBaseNr]} active={playingNotes.includes(sharpNotesNr[sharpNotesBaseNr])} type={'sharp-right'} width={'7.14%'}></Key>
                                        <Key key={sharpNotesNr[sharpNotesBaseNr + 1]} active={playingNotes.includes(sharpNotesNr[sharpNotesBaseNr + 1])} type={'sharp-left'} width={'7.14%'}></Key>
                                        <Key key={sharpNotesNr[sharpNotesBaseNr + 2]} active={playingNotes.includes(sharpNotesNr[sharpNotesBaseNr + 2])} type={'sharp-right'} width={'7.14%'}></Key>
                                        <Key key={sharpNotesNr[sharpNotesBaseNr + 3]} active={playingNotes.includes(sharpNotesNr[sharpNotesBaseNr + 3])} type={'sharp'} width={'4.7%'}></Key>
                                        <Key key={sharpNotesNr[sharpNotesBaseNr + 4]} active={playingNotes.includes(sharpNotesNr[sharpNotesBaseNr + 4])} type={'sharp-left'} width={'7.14%'}></Key>
                                    </>
                                )
                            })}
                        </div>
                        <div className="keys">
                            {roundNotesNr.map((n) => {
                                return <Key key={n} active={playingNotedown && (playingNotes.indexOf(n) !== -1)} type={'default'} height={'12vh'} width={'4.75%'}></Key>
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Sampler




    // useEffect(() => {
    //     window.addEventListener('keydown', handleKeyDown);
    //     window.addEventListener('keyup', handleKeyUp);
    //     const context = new AudioContext();
    //     setAudioContext(c => (context));
    //     loadAudio(audioUrl, context);
    //     return () => {
    //         window.removeEventListener('keydown', handleKeyDown);
    //         window.removeEventListener('keyup', handleKeyUp);
    //         context.close();
    //     };
    // }, []);
    // }, [octave, audioBuffer, playingNotes]);

    // useEffect(() => {
    //     const context = new AudioContext();
    //     setAudioContext(c => (context));
    //     loadAudio(audioUrl, context);
    //     return () => {
    //         context.close();
    //     }
    // }, []);

    // async function loadAudio(url, audioContext) {
    //     try {
    //       const response = await fetch(url);
    //       const arrayBuffer = await response.arrayBuffer();
    //       const audioBuff = await audioContext.decodeAudioData(arrayBuffer);
    //       setAudioBuffer(audioBuff);
    //     } catch (error) {
    //       console.error('Error loading audio:', error);
    //       return null;
    //     }
    //   }

    // function playAudio(event, octave) {
    //     if (audioContext && audioBuffer) {
    //         const source = audioContext.createBufferSource();
    //         source.buffer = audioBuffer;
    //         const noteNumber = translateKeyToNumber(event.key, octave);
    //         const detune = ((noteNumber - 12) * 100);
    //         source.detune.value = detune;
    //         const gainNode = audioContext.createGain();
    //         gainNode.gain.value = 0.5;
    //         source.connect(gainNode).connect(audioContext.destination);
    //         source.start();
    //       }
    //   }
