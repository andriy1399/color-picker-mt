import './App.css';
import PixelColorPicker from './components/ColorPicker';
// import ColorPickerTwo from './components/ColorPickerTwo';

function App() {
	// const handleColorSelect = (color: string) => {
	// 	console.log('Selected color:', color);
	// };
	return (
		<div>
			<PixelColorPicker />
			{/* <ColorPickerTwo onSelectColor={handleColorSelect} /> */}
		</div>
	);
}

export default App;
