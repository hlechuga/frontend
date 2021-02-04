import React from 'react';

class GetDateTime extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            date: null,
            time: null,
            timezone: null,
            errormsg: null
        };
        this.getData = this.getData.bind(this);
    }

    componentDidMount() {
        this.interval = setInterval(this.getData, 1000);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
      }

    getData() {
        // GET request using fetch with async/await
        fetch('/api/datetime')
            .then(async response => {
                const data = await response.json();

                // check for error response
                if (!response.ok) {
                    const error = response.statusText;
                    return Promise.reject(error);
                    
                }
                console.log('date fetched', data);
                this.setState({ date: data.date, time: data.time, timezone: data.timezone, errormsg: null })
            })
            .catch(error => {
                this.setState({ date: null, time: null, timezone: null, errormsg: "Unable to fetch server's date and time" });
                console.error('There was an error!', error);
            });
    }

    render() {
        const { date, time, timezone, errormsg } = this.state;
        return (
            <div className="jumbotron jumbotron-fluid" >
                 <div className="container">
                    <h1 class="display-4" >Server Datetime</h1>
                    <p class="lead"> {errormsg} {date} {time} {timezone} </p>
                </div>
            </div>
        );
    }
}

export default GetDateTime; 