const diameter = 24;
const borderSize = 4;

type Props = { x: number; y: number; startDrag: (event: React.MouseEvent<HTMLDivElement>) => void };

const Pin: React.FC<Props> = ({ x, y, startDrag }) => {
	const style = {
		position: 'absolute',
		top: y - diameter / 2,
		left: x - diameter / 2,
		borderRadius: '50%',
		border: `${borderSize}px solid white`,
		width: `${diameter}px`,
		height: `${diameter}px`,
		boxSizing: 'border-box',
	} as React.CSSProperties;

	return <div onMouseDown={startDrag} style={style} />;
};

export default Pin;
