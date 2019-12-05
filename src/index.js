import React from 'react'
import { render } from 'react-dom'
import './styles.css'

const { ipcRenderer } = window.require('electron')

class Menu extends React.Component {
    handleQuit() {
        ipcRenderer.send("msg-quit")
    }
    render() {
        return <button onClick={this.handleQuit}>Quit</button>
    }
}

const App = () => {
    return (
        <div className="bg-gray-900 text-white mx-auto max-w-sm rounded-lg overflow-hidden">
            <div className="flex items-center px-6 py-4">
                <div className="text-center text-left flex-grow">
                    <div className="mb-4">
                        <p className="text-xl leading-tight">Kashif</p>
                        <p className="text-sm leading-tight text-grey-dark">
                            Developer at NothingWorks Inc.
                        </p>
                    </div>
                    <div>
                        <button className="text-xs font-semibold rounded-full px-4 py-1 leading-normal bg-gray-900 border border-purple text-purple hover:bg-purple hover:text-white">
                            Message
                        </button>
                    </div>
                </div>
            </div>
            <Menu />
        </div>
    )
}

render(<App />, document.getElementById('root'))
