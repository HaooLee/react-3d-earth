import React from 'react'
import Device from './Device.js'

class React3dEarth extends React.Component {
    constructor(props) {
        super(props)
        const {style, config = {}} = this.props;

        this.state.webglStyle = {
            height: '500px',
            width: '500px',
            ...style
        }

        const {
            radius: globeRadius,
            mobileRadius,
            textureSrc,
            backgroundColor,
            autoRotationSpeed,
            draggingRotationSpeed,
            dotColor,
            flagLat,
            flagLon,
            flagScale,
            flagColor,
        } = config

        this.state.config = {
            globeRadius,
            mobileRadius,
            textureSrc,
            backgroundColor,
            autoRotationSpeed,
            draggingRotationSpeed,
            dotColor,
            flagLat,
            flagLon,
            flagScale,
            flagColor
        }
    }

    state = {}

    ref = React.createRef()

    componentDidMount() {
        const {config} = this.state
        this.t = new Device({
            ...config,
            parentNode: this.ref.current,
            spikeRadius: .06
        });
        this.t.init()
    }


    componentWillUnmount() {
        this.t && this.t.dispose()
    }

    render() {
        const {webglStyle} = this.state
        return (
            <div className="js-webgl-globe-wrap">
                <div className={`${this.props.className || ''} js-webgl-globe`} ref={this.ref} style={webglStyle}></div>
            </div>
        )
    }
}

export default React3dEarth
