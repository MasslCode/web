import * as Slider from "@radix-ui/react-slider";

// eslint-disable-next-line react/prop-types
export default function RatingSlider({ value = 5, min = 1, max = 10, step = 1, onChange }) {

  return(
    <div style={{ width: "28vw", margin: "1rem auto" }}>
      <Slider.Root
        className="SliderRoot"
        defaultValue={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={([val]) => onChange && onChange(val)}
      >
        <Slider.Track className="SliderTrack">
          <Slider.Range className="SliderRange" />
        </Slider.Track>
        <Slider.Thumb className="SliderThumb" />
      </Slider.Root>
    </div>
  );
}