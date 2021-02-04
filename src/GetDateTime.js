import React from 'react';

class GetDateTime extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            date: null,
            time: null,
            timezone: null
        };
    }

    componentDidMount() {
        // Simple GET request using fetch
        fetch('api/datetime')
            .then(response => response.json())
            .then(data => this.setState({ date: data.date, time: data.time, timezone: data.timezone}));
    }

    render() {
        const { date, time, timezone } = this.state;
        return (
            <div>
                <h1>Server Datetime</h1>
                <p> {date} {time} {timezone}</p>
            </div>
        );
    }
}

export default GetDateTime; 