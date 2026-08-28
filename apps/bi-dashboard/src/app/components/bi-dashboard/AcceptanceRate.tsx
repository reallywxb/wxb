import { useAcceptanceData } from '../../../hooks/useDashboard';
import SectionPanel from './SectionPanel';
import WaterGauge from './WaterGauge';

function DigitRow({
  digits,
  unit,
  color,
  borderColor,
}: {
  borderColor: string;
  color: string;
  digits: string[];
  unit: string;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {digits.map((d, i) =>
        d === '.' ? (
          <span
            key={i}
            style={{
              fontSize: 20,
              fontWeight: 800,
              color,
              lineHeight: 1,
              paddingBottom: 2,
              width: 8,
              textAlign: 'center',
            }}
          >
            .
          </span>
        ) : (
          <span
            key={i}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 24,
              height: 30,
              fontSize: 16,
              borderRadius: 3,
              fontFamily: 'monospace',
              fontWeight: 700,
              color,
              background:
                'linear-gradient(180deg, rgba(20,80,220,0.42) 0%, rgba(5,20,90,0.90) 100%)',
              border: `1px solid ${borderColor}`,
              boxShadow: `0 0 8px ${borderColor}40, inset 0 1px 0 rgba(255,255,255,0.07)`,
              textShadow: `0 0 8px ${color}99`,
            }}
          >
            {d}
          </span>
        ),
      )}
      <span style={{ fontSize: 10, color: '#88aadd', marginLeft: 3 }}>
        {unit}
      </span>
    </div>
  );
}

function BudgetBlock({
  label,
  totalDigits,
  totalUnit,
  doneDigits,
  doneUnit,
}: {
  doneDigits: string[];
  doneUnit: string;
  label: string;
  totalDigits: string[];
  totalUnit: string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        padding: '12px 12px',
      }}
    >
      {/* 预算 */}
      <div>
        <div
          style={{
            fontSize: 10,
            marginBottom: 10,
            color: '#88aadd',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <span
            style={{
              display: 'inline-block',
              width: 5,
              height: 5,
              borderRadius: '50%',
              background: '#3b9eff',
              boxShadow: '0 0 5px #3b9eff',
            }}
          />
          {label}预算
        </div>
        <DigitRow
          borderColor="rgba(59,158,255,0.55)"
          color="#3b9eff"
          digits={totalDigits}
          unit={totalUnit}
        />
      </div>
      {/* 完成数 */}
      <div>
        <div
          style={{
            fontSize: 10,
            marginBottom: 10,
            color: '#88aadd',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <span
            style={{
              display: 'inline-block',
              width: 5,
              height: 5,
              borderRadius: '50%',
              background: '#00bfff',
              boxShadow: '0 0 5px #00bfff',
            }}
          />
          预算完成数
        </div>
        <DigitRow
          borderColor="rgba(0,191,255,0.55)"
          color="#00bfff"
          digits={doneDigits}
          unit={doneUnit}
        />
      </div>
    </div>
  );
}

export default function AcceptanceRate() {
  const { data, loading } = useAcceptanceData();
console.log('useAcceptanceData:', data);
  if (loading || !data) {
    return (
      <SectionPanel title="全年预算执行总览">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: '#88aadd',
            fontSize: 12,
          }}
        >
          加载中...
        </div>
      </SectionPanel>
    );
  }

  return (
    <SectionPanel title="全年预算执行总览">
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: '1fr 1fr',
          gap: '0px 0px',
          height: '100%',
          alignItems: 'start',
        }}
      >
        {/* 左上：药品预算 + 完成数 */}
        <BudgetBlock
          doneDigits={data.drug.doneDigits}
          doneUnit={data.drug.doneUnit}
          label="药品"
          totalDigits={data.drug.totalDigits}
          totalUnit={data.drug.totalUnit}
        />

        {/* 右上：水位仪 */}
        <div style={{ justifySelf: 'start', alignSelf: 'center', marginLeft: '12px' }}>
          <WaterGauge
            label="药品预算使用率"
            percentage={data.drug.rate}
            size={104}
          />
        </div>

        {/* 左下：消杀物资预算 + 完成数 */}
        <BudgetBlock
          doneDigits={data.disinfection.doneDigits}
          doneUnit={data.disinfection.doneUnit}
          label="消杀物资"
          totalDigits={data.disinfection.totalDigits}
          totalUnit={data.disinfection.totalUnit}
        />

        {/* 右下：疫苗预算 + 完成数 */}
        <BudgetBlock
          doneDigits={data.vaccine.doneDigits}
          doneUnit={data.vaccine.doneUnit}
          label="疫苗"
          totalDigits={data.vaccine.totalDigits}
          totalUnit={data.vaccine.totalUnit}
        />
      </div>
    </SectionPanel>
  );
}
