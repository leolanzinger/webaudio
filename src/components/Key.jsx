import '../instruments.css'
import React, { useState } from 'react';

function Key(props) {
    
    return (
        <>
            {props.type == 'default' ?
                <div className={props.active ? `panel-light key active` : `panel-light key`} style={{width: props.width, height: props.height}}>
                    <div className="key-button"></div>
                </div> :
                (props.type == "sharp" ? 
                    <div className={props.active ? `panel-light key key-sharp active` : `panel-light key key-sharp`} style={{width: props.width, height: props.height}}>
                        <div className="key-button"></div>
                    </div> :
                    (props.type == "sharp-right" ?
                        <div className={props.active ? `panel-light key key-sharp key-sharp-right active` : `panel-light key key-sharp key-sharp-right`} style={{width: props.width, height: props.height}}>
                            <div className="key-button"></div>
                        </div>  :
                        <div className={props.active ? `panel-light key key-sharp key-sharp-left active` : `panel-light key key-sharp key-sharp-left`} style={{width: props.width, height: props.height}}>
                        <div className="key-button"></div>
                    </div>)
                )
            }
        </>
    )
}

export default Key
