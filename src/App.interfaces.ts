export interface Decision {
  value: boolean;
  reason?: string;
};

export interface HourlyDatapoint {
  will_it_rain: number;
  precip_mm: number;
  cloud: number;
  temp_c: number;
  wind_kph: number;
};

export interface Forecast {
  forecast: ForecastDay;
}

interface ForecastDay {
  forecastday: ForecastDayData[];
}

interface ForecastDayData {
  hour: HourlyDatapoint[];
}

export interface TitleProps {
  text: string;
};

export type SubtitleProps = TitleProps;

export interface LocationInfoProps {
  location: string
}
