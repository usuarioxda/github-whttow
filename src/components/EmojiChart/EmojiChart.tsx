import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Company, Metric, CompanyData } from '../../types';
import { EmojiCard } from './EmojiCard';
import { Controls } from './Controls';
import { Modal } from './Modal';
import { MobileView } from './MobileView';
import { calculateAverages } from './utils';

interface EmojiChartProps {
  companies: Company[];
  metrics: Metric[];
  data: CompanyData[];
}

export const EmojiChart: React.FC<EmojiChartProps> = ({
  companies,
  metrics,
  data,
}) => {
  const [isCompact, setIsCompact] = useState(false);
  const [highlightType, setHighlightType] = useState<'high' | 'low' | 'none'>('none');
  const [filterValue, setFilterValue] = useState(0);
  const [modalData, setModalData] = useState<{
    isOpen: boolean;
    value: number;
    metricName: string;
    companyName: string;
    metricAverage: number;
    companyAverage: number;
  }>({
    isOpen: false,
    value: 0,
    metricName: '',
    companyName: '',
    metricAverage: 0,
    companyAverage: 0,
  });

  const selectedCompanies = companies.filter(c => c.selected);
  const selectedMetrics = metrics.filter(m => m.selected);
  
  const { columnAverages, rowAverages } = useMemo(() => 
    calculateAverages(
      data.filter(row => selectedCompanies.some(c => c.name === row.Empresa)),
      selectedMetrics.map(m => m.name)
    ),
    [data, selectedCompanies, selectedMetrics]
  );

  const shouldHighlight = (value: number) => {
    if (highlightType === 'high') return value >= 80;
    if (highlightType === 'low') return value <= 30;
    return false;
  };

  const filteredData = data.filter(row => {
    if (!selectedCompanies.some(c => c.name === row.Empresa)) return false;
    if (filterValue === 0) return true;
    return selectedMetrics.some(metric => {
      const value = parseInt(row[metric.name] || '0', 10);
      return value >= filterValue;
    });
  });

  const handleCardClick = (params: {
    value: number;
    metricName: string;
    companyName: string;
    metricAverage: number;
    companyAverage: number;
  }) => {
    setModalData({
      isOpen: true,
      ...params,
    });
  };

  return (
    <div className="w-full bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-xl shadow-2xl mt-8">
      <h2 className="text-xl font-bold text-white mb-6">Análisis Empresarial - Gráfico de Emoticones</h2>
      
      <Controls
        onToggleCompact={() => setIsCompact(!isCompact)}
        isCompact={isCompact}
        onHighlightChange={setHighlightType}
        highlightType={highlightType}
        onFilterChange={setFilterValue}
        filterValue={filterValue}
      />

      {/* Mobile View */}
      <div className="md:hidden">
        <MobileView
          companies={companies}
          metrics={metrics}
          data={filteredData}
          onCardClick={handleCardClick}
        />
      </div>

      {/* Desktop View */}
      <motion.div
        layout
        className="hidden md:block overflow-x-auto"
      >
        <div className={`inline-block min-w-full bg-[rgba(0,0,0,0.3)] backdrop-blur-sm rounded-lg p-4 
          ${isCompact ? 'scale-90 origin-top' : ''}`}
        >
          <div className="grid gap-4" style={{ 
            gridTemplateColumns: `auto repeat(${selectedMetrics.length}, minmax(${isCompact ? '80px' : '120px'}, 1fr)) auto`
          }}>
            {/* Header */}
            <div className="bg-gray-800 rounded-lg p-4"></div>
            {selectedMetrics.map(metric => (
              <div key={metric.name} className="bg-gray-800 rounded-lg p-4 text-center text-sm font-medium text-gray-200">
                {metric.name}
              </div>
            ))}
            <div className="bg-gray-800 rounded-lg p-4 text-center text-sm font-medium text-gray-200">
              Promedio
            </div>

            {/* Data Rows */}
            <AnimatePresence>
              {filteredData.map((row, rowIndex) => (
                <motion.div
                  key={row.Empresa}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="contents"
                >
                  <div className="bg-gray-800 rounded-lg p-4 text-sm font-medium text-gray-200">
                    {row.Empresa}
                  </div>
                  {selectedMetrics.map((metric, metricIndex) => {
                    const value = parseInt(row[metric.name] || '0', 10);
                    return (
                      <EmojiCard
                        key={`${row.Empresa}-${metric.name}`}
                        value={value}
                        metricName={metric.name}
                        companyName={row.Empresa}
                        metricAverage={columnAverages[metricIndex]}
                        companyAverage={rowAverages[rowIndex]}
                        highlighted={shouldHighlight(value)}
                        onClick={() => handleCardClick({
                          value,
                          metricName: metric.name,
                          companyName: row.Empresa,
                          metricAverage: columnAverages[metricIndex],
                          companyAverage: rowAverages[rowIndex],
                        })}
                      />
                    );
                  })}
                  <EmojiCard
                    value={rowAverages[rowIndex]}
                    metricName="Promedio"
                    companyName={row.Empresa}
                    metricAverage={rowAverages[rowIndex]}
                    companyAverage={rowAverages[rowIndex]}
                    highlighted={shouldHighlight(rowAverages[rowIndex])}
                    onClick={() => handleCardClick({
                      value: rowAverages[rowIndex],
                      metricName: "Promedio",
                      companyName: row.Empresa,
                      metricAverage: rowAverages[rowIndex],
                      companyAverage: rowAverages[rowIndex],
                    })}
                  />
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Footer Row (Averages) */}
            <div className="bg-gray-800 rounded-lg p-4 text-sm font-medium text-gray-200">
              Promedio
            </div>
            {columnAverages.map((average, index) => (
              <EmojiCard
                key={`column-average-${index}`}
                value={average}
                metricName={selectedMetrics[index].name}
                companyName="Promedio General"
                metricAverage={average}
                companyAverage={average}
                highlighted={shouldHighlight(average)}
                onClick={() => handleCardClick({
                  value: average,
                  metricName: selectedMetrics[index].name,
                  companyName: "Promedio General",
                  metricAverage: average,
                  companyAverage: average,
                })}
              />
            ))}
            <div className="bg-gray-800 rounded-lg p-4"></div>
          </div>
        </div>
      </motion.div>

      {/* Modal */}
      <Modal
        isOpen={modalData.isOpen}
        onClose={() => setModalData(prev => ({ ...prev, isOpen: false }))}
        value={modalData.value}
        metricName={modalData.metricName}
        companyName={modalData.companyName}
        metricAverage={modalData.metricAverage}
        companyAverage={modalData.companyAverage}
      />
    </div>
  );
};