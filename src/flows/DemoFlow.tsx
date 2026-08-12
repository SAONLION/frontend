import { useState } from 'react';
import D1VisitPurpose from '../pages/StageD/D1VisitPurpose';
import D2ProductRecommendation from '../pages/StageD/D2ProductRecommendation';
import D21ProductLocationGuide from '../pages/StageD/D21ProductLocationGuide';
import E1StaffCallTray from '../pages/StageE/E1StaffCallTray';
import E2RequestReceived from '../pages/StageE/E2RequestReceived';

type ScreenId = 'D1' | 'D2' | 'D2-1' | 'E1' | 'E2';

interface SelectedProduct {
  image: string;
  name: string;
  description: string | string[];
}

export default function DemoFlow() {
  const [screen, setScreen] = useState<ScreenId>('D1');
  const [purpose, setPurpose] = useState('여행');
  const [selectedProduct, setSelectedProduct] = useState<SelectedProduct | null>(null);
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);

  switch (screen) {
    case 'D1':
      return (
        <D1VisitPurpose
          onSelectPurpose={(value) => {
            setPurpose(value);
            setScreen('D2');
          }}
          onCallStaff={() => setScreen('E1')}
        />
      );

    case 'D2':
      return (
        <D2ProductRecommendation
          purpose={purpose}
          onSelectProduct={(product) => {
            setSelectedProduct(product);
            setScreen('D2-1');
          }}
          onCallStaff={() => setScreen('E1')}
        />
      );

    case 'D2-1':
      return (
        selectedProduct && (
          <D21ProductLocationGuide
            selectedProduct={selectedProduct}
            onViewOtherProducts={() => setScreen('D2')}
          />
        )
      );

    case 'E1':
      return (
        <E1StaffCallTray
          onChangeSelectedRequests={(selected) => {
            const latest = selected[selected.length - 1];
            if (latest) {
              setSelectedRequests([latest]);
              setScreen('E2');
            }
          }}
          onSelectOther={() => {
            setSelectedRequests(['기타']);
            setScreen('E2');
          }}
        />
      );

    case 'E2':
      return <E2RequestReceived selectedRequests={selectedRequests} />;
  }
}
