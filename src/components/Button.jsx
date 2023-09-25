import '../instruments.css'

function Button(props) {
  return (
    <div className={props.active ? `panel-light button active` : `panel-light button`} style={{width: props.width, height: props.height}}>
        {props.children}
    </div>
  )
}

export default Button
