import '../instruments.css'

function Progress(props) {
  return (
    <div className="progress" style={{width: props.width, height: props.height}}>
        {props.type == "empty" ?
        <div className="empty"></div> :
        <div className="full"></div>
        }
    </div>
  )
}

export default Progress
