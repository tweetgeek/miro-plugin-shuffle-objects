import IPluginConfig = SDK.IPluginConfig;
import IWidget = SDK.IWidget;

const svgIcon = require('./random.svg');

interface Widget extends IWidget {
  x: number;
  y: number;
  type: string;
  text?: string;
}

function shuffleArray(array: Array<any>) {
  // eslint-disable-next-line no-plusplus
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    // eslint-disable-next-line no-param-reassign
    [array[i], array[j]] = [array[j], array[i]];
  }
}

const buildLoaders = (widgets: IWidget[]): Widget[] =>
  [...widgets].map(
    (widget: Widget) =>
      ({
        type: 'sticker',
        text: '👀',
        x: widget.x,
        y: widget.y,
      } as Widget),
  );

const onClick = async () => {
  const selectedWidgets: IWidget[] = await miro.board.selection.get();
  if (!selectedWidgets.length) {
    await miro.showErrorNotification('🚨 Select items to shuffle!');
    return;
  }

  if (selectedWidgets.length <= 1) {
    await miro.showErrorNotification('🚨 Select more items to shuffle!');
    return;
  }

  const shuffledWidgets: IWidget[] = [...selectedWidgets];
  shuffleArray(shuffledWidgets);

  const loaders: IWidget[] = await miro.board.widgets.create(buildLoaders(selectedWidgets));
  const selectedIds: string[] = [...selectedWidgets].map((widget: Widget) => widget.id);
  const newWidgets: Widget[] = [...selectedWidgets].map((widget: Widget, index: number) => {
    const {
      bounds: { x, y },
    }: { bounds: { x: number; y: number } } = shuffledWidgets[index];
    return { ...widget, x, y } as Widget;
  });

  await miro.board.widgets.deleteById(selectedIds);
  await miro.board.widgets.create(newWidgets);
  await miro.board.widgets.deleteById(loaders.map((item: Widget) => item.id));
  await miro.showNotification('Shuffled 😎');
};

const config: IPluginConfig = {
  extensionPoints: {
    bottomBar: {
      title: 'Shuffle selected items',
      svgIcon,
      onClick,
    },
  },
};

miro.onReady(async () => {
  try {
    await miro.initialize(config);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    miro.showErrorNotification(error);
  }
});
