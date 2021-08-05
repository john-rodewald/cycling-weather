import { useEffect, useState } from 'react';
import { Decision, Forecast, HourlyDatapoint, LocationInfoProps, SubtitleProps, TitleProps } from './App.interfaces';
import './App.css';

// tweakable thresholds
const CONSTANTS: Record<string, number> = {
  minimumTemperature: 15,
  maximumTemperature: 25,
  maximumWindSpeed: 20,
  maximumCloudCoverage: 70,
  hoursIntoFuture: 2,
};

const STRINGS: Record<string, string> = {
  apiKeyMessage: 'Enter your weatherAPI key:',
  locationMessage: 'Enter your location:',
  title: 'Is it a good idea to go cycling today?',
  dataMessage: 'There is no data yet.',
  coldMessage: 'Temperature is too cold.',
  hotMessage: 'Temperature is too hot.',
  windMessage: 'There is too much wind.',
  rainMessage: 'It will probably rain.',
  githubLink: 'https://john-rodewald.github.io/',
  yes: 'Yes!',
  no: 'No.',
};

// API fetch
async function loadForecast(location: string, apiKey: string): Promise<Forecast> {
  const response = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${location}&days=1&aqi=no&alerts=no`)
    .then(res => res.ok && res.json())
    .catch(err => window.alert(err));

  return response;
}

// Data processing
function decide(forecast: Forecast | undefined): Decision {
  if (!forecast) return { value: false, reason: STRINGS.dataMessage };

  const currentHour = new Date().getHours();
  const data: HourlyDatapoint[] = forecast.forecast.forecastday[0].hour.slice(currentHour, currentHour + CONSTANTS.hoursIntoFuture);
  const averageTemperature: number = data.reduce((prev, acc) => prev + acc.temp_c, 0) / data.length;
  const averageWindSpeed: number = data.reduce((prev, acc) => prev + acc.wind_kph, 0) / data.length;
  const averageCloudCoverage: number = data.reduce((prev, acc) => prev + acc.cloud, 0) / data.length;
  const willItRain: boolean = data.filter((point) => point.will_it_rain === 1).length > 0;
  const averageRainAmount: number = data.reduce((prev, acc) => prev + acc.precip_mm, 0) / data.length;
  console.log('data', data);
  console.log('averageRainAmount', averageRainAmount);
  console.log('averageTemperature', averageTemperature);
  console.log('averageWindSpeed', averageWindSpeed);

  if (averageTemperature < CONSTANTS.minimumTemperature)
    return { value: false, reason: STRINGS.coldMessage };

  if (averageTemperature > CONSTANTS.maximumTemperature)
    return { value: false, reason: STRINGS.hotMessage };

  if (averageWindSpeed > CONSTANTS.maximumWindSpeed)
    return { value: false, reason: STRINGS.windMessage };

  if (averageCloudCoverage > CONSTANTS.maximumCloudCoverage || (willItRain && averageRainAmount > 1))
    return { value: false, reason: STRINGS.rainMessage };

  return { value: true };
}

// Components - could be in their separate files
const Title = ({ text }: TitleProps) => <h1 className="title">{text}</h1>;
const Subtitle = ({ text }: SubtitleProps) => <h2 className="subtitle">{text}</h2>;
const LocationInfo = ({ location }: LocationInfoProps) => <p className="location">({location})</p>;
const GithubLink = () => <a href={STRINGS.githubLink}><img alt="github-icon" className="github-img" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRZcKR3b2Q6L7kLv3kV04kBtcs-FaYRsYfxRQ&usqp=CAU"/></a>;

// Main entry point
const App = () => {
  const [decision, setDecision] = useState<Decision>({ value: false, reason: STRINGS.dataMessage });
  const [currentLocation, setCurrentLocation] = useState<string>('');
  const [currentApiKey, setCurrentApiKey] = useState<string>(localStorage.getItem('cycling-api-key') ?? '');

  useEffect(() => {
    if (!currentApiKey) {
      const apiKey = window.prompt(STRINGS.apiKeyMessage) ?? '';
      localStorage.setItem('cycling-api-key', apiKey);
      setCurrentApiKey(apiKey);
    }
    const location = window.prompt(STRINGS.locationMessage) ?? '';
    setCurrentLocation(location);
    loadForecast(location, currentApiKey).then((forecast) => {
      setDecision(decide(forecast));
    });
  }, [currentApiKey]);

  return (
    <div className="App">
      <header className="App-header">
        <span className="header-container">
          <Title text={STRINGS.title} />
          <Subtitle text={decision.value ? STRINGS.yes : `${STRINGS.no} ${decision.reason ?? ''}`} />
          {currentLocation && <LocationInfo location={currentLocation} />}
        </span>
      </header>
      <footer>
        <GithubLink />
      </footer>
    </div>
  );
}

export default App;
