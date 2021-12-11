import PropTypes from 'https://dev.jspm.io/prop-types@15.6.1';
import React from 'https://dev.jspm.io/react@16.8.6';

export default class HeatMap extends React.Component {
    heatLevels = ['none', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth'];
    grainLevels = [1, 2, 3, 4, 6, 8, 12, 24];
    colorsDefault = 5;
    grainLevelDefault = 7;
    footers = [];
    displayMap = [];
    
    constructor(props) {
        super(props);

        this.state = { 
            getDisplayMap: () => this.getOrganizedData(),
            colors: this.colorsDefault,
            grainLevel: this.grainLevelDefault,
            grain: () => this.grainLevels[this.state.grainLevel],
            unitSize: () => this.getUnitSize(),
            enabledMap: [],
        };

        this.state.enabledMap = this.resetEnabledMap();
    }

    static get propTypes() {
        return {
            data: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired
        }
    }
    
    resetEnabledMap() {
        const enabledRow = new Array(this.state.grain()).fill(true);
        const enabledMap = new Array(7);
        for (let i = 0; i < 7; i++) {
            enabledMap[i] = enabledRow.slice();
        }
        return enabledMap;
    }

    getOrganizedData() {
        const sortedDates = this.props.data.sort((a, b) =>
        a.localeCompare(b));

        const displayRow = new Array(this.state.grain()).fill(0);
        const displayMap = new Array(7).fill(null);

        for (let i = 0; i < 7; i++) {
            displayMap[i] = displayRow.slice();
        }

        for (let i = 0; i < sortedDates.length; i++) {
            const date = new Date(sortedDates[i]);
            const day = date.getDay();
            const hour = date.getHours();
            const timeSlot = Math.trunc(hour * this.state.grain() / 24);
            if (this.state.enabledMap[day][timeSlot]) {
                displayMap[day][timeSlot]++;
            } else {
                displayMap[day][timeSlot] = -1;
            }
        };    

        this.displayMap = displayMap;
        return displayMap;
    }

    getUnitSize() {
        const displayMap = this.displayMap;
        const colors = this.state.colors;
        let maxArr = [];
        for (let i = 0; i < 7; i++) {
            maxArr.push(Math.max(...displayMap[i]));
        }
        return Math.round(Math.max(...maxArr) / colors);
    }

    getHeat = (forValue) => {
        if (forValue === -1) return this.heatLevels[0];
        return this.heatLevels[Math.round(forValue / this.state.unitSize())+1];
    }
    
    updateColorsValue = (e) => {
        this.setState({
            colors: e.target.value
        });
    }

    updateGrainValue = (e) => {
        this.resetEnabledMap();
        this.setState({
            grainLevel: e.target.value,
        });
    }

    clickDot = (e) => {
        const day = e.target.parentElement.rowIndex;
        const timeSlot = e.target.cellIndex-1;
        const enabledMap = this.state.enabledMap;
        enabledMap[day][timeSlot] = !enabledMap[day][timeSlot];
        this.setState({
            enabledMap: enabledMap
        });
    }

    getSubtitle() {
        let count = this.props.data.length;
        return `Found ${count} items!`;
    }

    render() {
        return React.createElement('div', {},
            React.createElement('h1', {}, 'Armis HeatMap Exercise'),
            React.createElement('h2', {}, this.getSubtitle()),
            React.createElement(Slider, {
                id: 'colors',
                label: 'Colors:',
                min: 1,
                max: 8,
                value: this.state.colors,
                callBack: this.updateColorsValue
            }),
            React.createElement('table', {}, 
                React.createElement('tbody', {}, 
                    this.state.getDisplayMap().map((row, index) => {
                        return React.createElement(Row, {
                            index: index, 
                            data: row, 
                            getHeat: this.getHeat,
                            callBack: this.clickDot
                         })
                    })
                ),
                React.createElement('tfoot', {}, 
                    React.createElement('tr', {}, 
                        React.createElement('th', {}, ''),
                        React.createElement('th', {}, '0:00'),
                        React.createElement('td', {
                            colSpan: this.state.grain()-2
                        }),
                        React.createElement('th', {}, '24:00')
                )
            )

            ),
            React.createElement(Slider, {
                id: 'grain',
                label: 'Grain:',
                min: 0,
                max: 7,
                value: this.state.grainLevel,
                callBack: this.updateGrainValue
            }),

        );
    }
}

class Row extends React.Component {
    days = ['sun', 'mon', 'tue', 'wed', 'thur', 'fri', 'sat'];
    render () {
        return React.createElement('tr', {
            key: this.props.index
        },
            React.createElement('th', {}, this.days[this.props.index]),
            this.props.data.map((heat, index) => {
                return React.createElement(Cell, {
                    index: index,
                    heatLevel: heat,
                    getHeat: this.props.getHeat,
                    callBack: this.props.callBack
                })
            })
        );
    }
}

class Cell extends React.Component {
    render() {
        return React.createElement('td', {
            key: this.props.index, 
            className: this.props.getHeat(this.props.heatLevel), 
            dangerouslySetInnerHTML: {__html: '&#8226;'},
            onClick: this.props.callBack
        });
    }

}

class Slider extends React.Component {
    render() {
        return React.createElement('label', {}, 
            this.props.label,
            React.createElement('input', {
                type: 'range',
                value: this.props.value,
                id: this.props.id,
                min: this.props.min,
                max: this.props.max,
                onChange: this.props.callBack,
            })        
        );
    }
}
