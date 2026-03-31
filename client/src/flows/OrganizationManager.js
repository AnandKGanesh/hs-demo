import React, { useState, useRef } from 'react';
import { Info, Plus, X, Settings, User, CreditCard, Bot, Sparkles, Code, BookOpen } from 'lucide-react';

const OrganizationManager = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [merchantName, setMerchantName] = useState('');
  const [merchantType, setMerchantType] = useState('connected');
  const [nextMerchantId, setNextMerchantId] = useState(6);
  const [merchants, setMerchants] = useState({
    shared: [],
    isolated: []
  });
  const [hoveredElement, setHoveredElement] = useState(null);
  const hoverTimeoutRef = useRef(null);

  const handleMouseEnter = (elementKey) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setHoveredElement(elementKey);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredElement(null);
    }, 300);
  };

  const explanations = {
    operator: {
      title: 'Operator',
      bullets: [
        'Top-level entity that manages the entire platform organization structure',
        'Highest level of administrative control',
        'Oversees all organizations and platform operations'
      ]
    },
    organization: {
      title: 'Organization',
      bullets: [
        'Platform Organization enables businesses to manage multiple merchants programmatically',
        'Provides centralized control over merchant lifecycle',
        'Supports both Connected and Standard merchant models'
      ]
    },
    platformMerchant: {
      title: 'Platform Merchant',
      bullets: [
        'Privileged parent merchant that creates and manages other merchants',
        'Cannot process payments for itself',
        'Owns API keys for merchant management',
        'Can act on behalf of Connected merchants'
      ]
    },
    sharedCustomers: {
      title: 'Shared Customers',
      bullets: [
        'Customer data shared across all Connected merchants',
        'Customers created here are accessible to Platform Merchant',
        'All Connected merchants can access shared customer data'
      ]
    },
    sharedCardvault: {
      title: 'Shared Cardvault',
      bullets: [
        'Payment methods shared across all Connected merchants',
        'Saved payment methods accessible across shared scope',
        'Enables seamless payment experience across merchants'
      ]
    },
    connectedMerchant: {
      title: 'Connected Merchant',
      bullets: [
        'Participates in shared resource model',
        'Shares Customers and Payment Methods with Platform Merchant',
        'Can be operated using Platform API key',
        'Benefits from shared infrastructure and data'
      ]
    },
    standardMerchant: {
      title: 'Standard Merchant',
      bullets: [
        'Maintains isolated Customers and Payment Methods',
        'Platform Merchant cannot act operationally on their behalf',
        'Limited to org-level management only',
        'Complete data isolation from other merchants'
      ]
    },
    profile: {
      title: 'Business Profile',
      bullets: [
        'Contains transaction settings and configurations',
        'Defines routing rules for payment processing',
        'Manages connector configurations',
        'Each merchant can have multiple profiles'
      ]
    },
    apiKey: {
      title: 'API Key',
      bullets: [
        'API credentials for authentication and authorization',
        'Platform API Key manages merchant operations',
        'Merchant API Keys process payments',
        'Different keys for different levels of access'
      ]
    }
  };

  const handleAddMerchant = () => {
    if (!merchantName.trim()) return;
    
    const newMerchant = {
      id: nextMerchantId,
      name: merchantName.trim(),
      type: merchantType
    };
    
    if (merchantType === 'connected') {
      setMerchants(prev => ({ ...prev, shared: [...prev.shared, newMerchant] }));
    } else {
      setMerchants(prev => ({ ...prev, isolated: [...prev.isolated, newMerchant] }));
    }
    
    setNextMerchantId(prev => prev + 1);
    setMerchantName('');
    setMerchantType('connected');
    setShowAddModal(false);
  };

  const currentElement = hoveredElement ? explanations[hoveredElement] : null;

  return (
    <div className="space-y-3">
      <div>
        <div className="flex flex-col gap-3 mb-4">
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-lg p-3 border border-slate-200 dark:border-slate-700" style={{ maxWidth: '700px' }}>
            <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Info size={14} />
              {currentElement ? currentElement.title : 'Element Details'}
            </h4>
            <div className="h-[80px] overflow-y-auto">
              {currentElement ? (
                <ul className="space-y-1">
                  {currentElement.bullets.map((bullet, index) => (
                    <li key={index} className="text-sm text-slate-800 dark:text-slate-200 flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="h-full flex items-center">
                  <p className="text-sm text-slate-400 dark:text-slate-500 italic text-left px-4 w-full">
                    Hover over any diagram element to see its definition and purpose.
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-start">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-primary hover:bg-primary-dark text-white font-medium px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap"
            >
              <Plus size={18} />
              Add New Merchant
            </button>
          </div>
        </div>
        
        <div className="flex flex-col items-center pt-2">
          <div 
            className="bg-orange-100 border-2 border-orange-300 rounded-lg px-16 py-3 mb-4 cursor-pointer hover:ring-4 hover:ring-orange-200 transition-all"
            onMouseEnter={() => handleMouseEnter('operator')}
            onMouseLeave={handleMouseLeave}
          >
            <span className="font-bold text-lg text-orange-800">Operator</span>
          </div>
          <div className="w-0.5 h-6 bg-gray-300 mb-4"></div>
          <div 
            className="bg-green-100 border-2 border-green-300 rounded-lg px-10 py-2 mb-6 cursor-pointer hover:ring-4 hover:ring-green-200 transition-all"
            onMouseEnter={() => handleMouseEnter('organization')}
            onMouseLeave={handleMouseLeave}
          >
            <span className="font-bold text-lg text-green-800">Organization</span>
          </div>
          <div className="w-0.5 h-6 bg-gray-300"></div>
          
          <div className="relative w-full min-w-max">
            <div className="absolute top-0 left-0 right-0 h-4">
              <div className="absolute top-0 left-[25%] right-[35%] h-0.5 bg-gray-300"></div>
              <div className="absolute top-0 left-[25%] w-0.5 h-4 bg-gray-300"></div>
              <div className="absolute top-0 right-[35%] w-0.5 h-4 bg-gray-300"></div>
            </div>
          </div>

          <div className="grid grid-cols-[3fr_2fr] gap-6 w-full min-w-max pt-3">
            <div className="border-2 border-blue-300 rounded-xl p-4 bg-blue-50/20">
              <h4 className="text-sm font-bold text-gray-800 mb-6 text-center border-b border-blue-200 pb-2">
                Shared Customers and Payment methods
              </h4>
              
              <div className="flex flex-col gap-6">
                <div className="flex justify-center gap-8">
                  <div 
                    className="bg-cyan-100 border-2 border-cyan-400 rounded-full px-10 py-4 cursor-pointer hover:ring-4 hover:ring-cyan-200 transition-all"
                    onMouseEnter={() => handleMouseEnter('sharedCustomers')}
                    onMouseLeave={handleMouseLeave}
                  >
                    <div className="flex items-center gap-2 text-cyan-900 font-semibold text-sm">
                      <User size={16} />
                      <span>Customers</span>
                    </div>
                  </div>
                  <div 
                    className="bg-cyan-100 border-2 border-cyan-400 rounded-full px-10 py-4 cursor-pointer hover:ring-4 hover:ring-cyan-200 transition-all"
                    onMouseEnter={() => handleMouseEnter('sharedCardvault')}
                    onMouseLeave={handleMouseLeave}
                  >
                    <div className="flex items-center gap-2 text-cyan-900 font-semibold text-sm">
                      <CreditCard size={16} />
                      <span>Cardvault</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-center gap-5 overflow-x-auto pb-2">
                  <div className="flex flex-col items-center gap-1 w-44 shrink-0">
                    <div 
                      className="bg-teal-100 border border-teal-300 rounded-lg p-3 w-full h-full cursor-pointer hover:ring-4 hover:ring-teal-200 transition-all"
                      onMouseEnter={() => handleMouseEnter('platformMerchant')}
                      onMouseLeave={handleMouseLeave}
                    >
                      <div className="text-xs font-bold text-teal-800 mb-1">Platform Merchant</div>
                      <div className="text-[10px] text-gray-600 space-y-0.5">
                        <div className="flex items-center gap-0.5"><Settings size={8} /><span>API key</span></div>
                      </div>
                    </div>
                    <div className="w-0.5 h-4"></div>
                    <div className="w-full h-[60px]"></div>
                  </div>

                  <div className="flex flex-col items-center gap-1 w-44 shrink-0">
                    <div 
                      className="bg-blue-100 border border-blue-300 rounded-lg p-3 w-full cursor-pointer hover:ring-4 hover:ring-blue-200 transition-all"
                      onMouseEnter={() => handleMouseEnter('connectedMerchant')}
                      onMouseLeave={handleMouseLeave}
                    >
                      <div className="text-xs font-bold text-blue-900 mb-1">Merchant 2</div>
                      <div className="text-[10px] text-gray-600 space-y-0.5">
                        <div className="flex items-center gap-0.5"><Settings size={8} /><span>API key</span></div>
                      </div>
                    </div>
                    <div className="w-0.5 h-4 bg-gray-300"></div>
                    <div 
                      className="bg-purple-100 border border-purple-300 rounded-lg p-3 w-full cursor-pointer hover:ring-4 hover:ring-purple-200 transition-all"
                      onMouseEnter={() => handleMouseEnter('profile')}
                      onMouseLeave={handleMouseLeave}
                    >
                      <div className="text-[10px] font-semibold text-purple-800 mb-0.5">Profile 2A</div>
                      <div className="text-[10px] text-gray-600 space-y-0">
                        <div className="flex items-center gap-0.5"><Settings size={6} /><span>Transactions</span></div>
                        <div className="flex items-center gap-0.5"><Settings size={6} /><span>Routing Rules</span></div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-1 w-44 shrink-0">
                    <div 
                      className="bg-blue-100 border border-blue-300 rounded-lg p-3 w-full cursor-pointer hover:ring-4 hover:ring-blue-200 transition-all"
                      onMouseEnter={() => handleMouseEnter('connectedMerchant')}
                      onMouseLeave={handleMouseLeave}
                    >
                      <div className="text-xs font-bold text-blue-900 mb-1">Merchant 3</div>
                      <div className="text-[10px] text-gray-600 space-y-0.5">
                        <div className="flex items-center gap-0.5"><Settings size={8} /><span>API key</span></div>
                      </div>
                    </div>
                    <div className="w-0.5 h-4 bg-gray-300"></div>
                    <div className="space-y-1 w-full">
                      <div 
                        className="bg-purple-100 border border-purple-300 rounded-lg p-3 cursor-pointer hover:ring-4 hover:ring-purple-200 transition-all"
                        onMouseEnter={() => handleMouseEnter('profile')}
                        onMouseLeave={handleMouseLeave}
                      >
                        <div className="text-[10px] font-semibold text-purple-800 mb-0.5">Profile 3A</div>
                        <div className="text-[10px] text-gray-600 space-y-0">
                          <div className="flex items-center gap-0.5"><Settings size={6} /><span>Transactions</span></div>
                          <div className="flex items-center gap-0.5"><Settings size={6} /><span>Routing Rules</span></div>
                        </div>
                      </div>
                      <div 
                        className="bg-purple-100 border border-purple-300 rounded-lg p-2 cursor-pointer hover:ring-4 hover:ring-purple-200 transition-all"
                        onMouseEnter={() => handleMouseEnter('profile')}
                        onMouseLeave={handleMouseLeave}
                      >
                        <div className="text-[10px] font-semibold text-purple-800 mb-0.5">Profile 3B</div>
                        <div className="text-[10px] text-gray-600 space-y-0">
                          <div className="flex items-center gap-0.5"><Settings size={6} /><span>Transactions</span></div>
                          <div className="flex items-center gap-0.5"><Settings size={6} /><span>Routing Rules</span></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {merchants.shared.map((merchant) => (
                    <div key={merchant.id} className="flex flex-col items-center gap-1 w-36 shrink-0">
                      <div 
                        className="bg-blue-100 border border-blue-300 rounded-lg p-2 w-full cursor-pointer hover:ring-4 hover:ring-blue-200 transition-all"
                        onMouseEnter={() => handleMouseEnter('connectedMerchant')}
                        onMouseLeave={handleMouseLeave}
                      >
                        <div className="text-xs font-bold text-blue-900 mb-1">{merchant.name}</div>
                        <div className="text-[10px] text-gray-600 space-y-0.5">
                          <div className="flex items-center gap-0.5"><Settings size={8} /><span>API key</span></div>
                        </div>
                      </div>
                      <div className="w-0.5 h-3 bg-gray-300"></div>
                      <div 
                        className="bg-purple-100 border border-purple-300 rounded-lg p-2 w-full cursor-pointer hover:ring-4 hover:ring-purple-200 transition-all"
                        onMouseEnter={() => handleMouseEnter('profile')}
                        onMouseLeave={handleMouseLeave}
                      >
                        <div className="text-[10px] font-semibold text-purple-800 mb-0.5">Profile {merchant.id}A</div>
                        <div className="text-[10px] text-gray-600 space-y-0">
                          <div className="flex items-center gap-0.5"><Settings size={6} /><span>Transactions</span></div>
                          <div className="flex items-center gap-0.5"><Settings size={6} /><span>Routing Rules</span></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-2 border-blue-300 rounded-xl p-4 bg-blue-50/20">
              <h4 className="text-sm font-bold text-gray-800 mb-6 text-center border-b border-blue-200 pb-2">
                Isolated Customers and Payment methods
              </h4>
              
              <div className="flex flex-col gap-6">
                <div className="flex justify-center gap-6 min-h-[58px]">
                  <div className="invisible bg-cyan-100 border-2 border-cyan-400 rounded-full px-8 py-3">
                    <div className="flex items-center gap-2 text-cyan-900 font-semibold text-sm">
                      <User size={14} />
                      <span>Customers</span>
                    </div>
                  </div>
                  <div className="invisible bg-cyan-100 border-2 border-cyan-400 rounded-full px-8 py-3">
                    <div className="flex items-center gap-2 text-cyan-900 font-semibold text-sm">
                      <CreditCard size={14} />
                      <span>Cardvault</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-center gap-3 overflow-x-auto pb-2">
                  <div className="flex flex-col items-center gap-1 w-36 shrink-0">
                    <div 
                      className="bg-blue-100 border border-blue-300 rounded-lg p-2 w-full cursor-pointer hover:ring-4 hover:ring-blue-200 transition-all"
                      onMouseEnter={() => handleMouseEnter('standardMerchant')}
                      onMouseLeave={handleMouseLeave}
                    >
                      <div className="text-xs font-bold text-blue-900 mb-1">Merchant 4</div>
                      <div className="text-[10px] text-gray-600 space-y-0.5">
                        <div className="flex items-center gap-0.5"><Settings size={8} /><span>API key</span></div>
                        <div className="flex items-center gap-0.5"><User size={8} /><span>Customers</span></div>
                        <div className="flex items-center gap-0.5"><CreditCard size={8} /><span>Cardvault</span></div>
                      </div>
                    </div>
                    <div className="w-0.5 h-3 bg-gray-300"></div>
                    <div className="space-y-1 w-full">
                      <div 
                        className="bg-purple-100 border border-purple-300 rounded-lg p-2 cursor-pointer hover:ring-4 hover:ring-purple-200 transition-all"
                        onMouseEnter={() => handleMouseEnter('profile')}
                        onMouseLeave={handleMouseLeave}
                      >
                        <div className="text-[10px] font-semibold text-purple-800 mb-0.5">Profile 4A</div>
                        <div className="text-[10px] text-gray-600 space-y-0">
                          <div className="flex items-center gap-0.5"><Settings size={6} /><span>Transactions</span></div>
                          <div className="flex items-center gap-0.5"><Settings size={6} /><span>Routing Rules</span></div>
                        </div>
                      </div>
                      <div 
                        className="bg-purple-100 border border-purple-300 rounded-lg p-2 cursor-pointer hover:ring-4 hover:ring-purple-200 transition-all"
                        onMouseEnter={() => handleMouseEnter('profile')}
                        onMouseLeave={handleMouseLeave}
                      >
                        <div className="text-[10px] font-semibold text-purple-800 mb-0.5">Profile 4B</div>
                        <div className="text-[10px] text-gray-600 space-y-0">
                          <div className="flex items-center gap-0.5"><Settings size={6} /><span>Transactions</span></div>
                          <div className="flex items-center gap-0.5"><Settings size={6} /><span>Routing Rules</span></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center gap-1 w-36 shrink-0">
                    <div 
                      className="bg-blue-100 border border-blue-300 rounded-lg p-2 w-full cursor-pointer hover:ring-4 hover:ring-blue-200 transition-all"
                      onMouseEnter={() => handleMouseEnter('standardMerchant')}
                      onMouseLeave={handleMouseLeave}
                    >
                      <div className="text-xs font-bold text-blue-900 mb-1">Merchant 5</div>
                      <div className="text-[10px] text-gray-600 space-y-0.5">
                        <div className="flex items-center gap-0.5"><Settings size={8} /><span>API key</span></div>
                        <div className="flex items-center gap-0.5"><User size={8} /><span>Customers</span></div>
                        <div className="flex items-center gap-0.5"><CreditCard size={8} /><span>Cardvault</span></div>
                      </div>
                    </div>
                    <div className="w-0.5 h-3 bg-gray-300"></div>
                    <div className="space-y-1 w-full">
                      <div 
                        className="bg-purple-100 border border-purple-300 rounded-lg p-2 cursor-pointer hover:ring-4 hover:ring-purple-200 transition-all"
                        onMouseEnter={() => handleMouseEnter('profile')}
                        onMouseLeave={handleMouseLeave}
                      >
                        <div className="text-[10px] font-semibold text-purple-800 mb-0.5">Profile 5A</div>
                        <div className="text-[10px] text-gray-600 space-y-0">
                          <div className="flex items-center gap-0.5"><Settings size={6} /><span>Transactions</span></div>
                          <div className="flex items-center gap-0.5"><Settings size={6} /><span>Routing Rules</span></div>
                        </div>
                      </div>
                      <div 
                        className="bg-purple-100 border border-purple-300 rounded-lg p-2 cursor-pointer hover:ring-4 hover:ring-purple-200 transition-all"
                        onMouseEnter={() => handleMouseEnter('profile')}
                        onMouseLeave={handleMouseLeave}
                      >
                        <div className="text-[10px] font-semibold text-purple-800 mb-0.5">Profile 5B</div>
                        <div className="text-[10px] text-gray-600 space-y-0">
                          <div className="flex items-center gap-0.5"><Settings size={6} /><span>Transactions</span></div>
                          <div className="flex items-center gap-0.5"><Settings size={6} /><span>Routing Rules</span></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {merchants.isolated.map((merchant) => (
                    <div key={merchant.id} className="flex flex-col items-center gap-1 w-36 shrink-0">
                      <div 
                        className="bg-blue-100 border border-blue-300 rounded-lg p-2 w-full cursor-pointer hover:ring-4 hover:ring-blue-200 transition-all"
                        onMouseEnter={() => handleMouseEnter('standardMerchant')}
                        onMouseLeave={handleMouseLeave}
                      >
                        <div className="text-xs font-bold text-blue-900 mb-1">{merchant.name}</div>
                        <div className="text-[10px] text-gray-600 space-y-0.5">
                          <div className="flex items-center gap-0.5"><Settings size={8} /><span>API key</span></div>
                          <div className="flex items-center gap-0.5"><User size={8} /><span>Customers</span></div>
                          <div className="flex items-center gap-0.5"><CreditCard size={8} /><span>Cardvault</span></div>
                        </div>
                      </div>
                      <div className="w-0.5 h-3 bg-gray-300"></div>
                      <div className="space-y-1 w-full">
                        <div 
                          className="bg-purple-100 border border-purple-300 rounded-lg p-2 cursor-pointer hover:ring-4 hover:ring-purple-200 transition-all"
                          onMouseEnter={() => handleMouseEnter('profile')}
                          onMouseLeave={handleMouseLeave}
                        >
                          <div className="text-[10px] font-semibold text-purple-800 mb-0.5">Profile {merchant.id}A</div>
                          <div className="text-[10px] text-gray-600 space-y-0">
                            <div className="flex items-center gap-0.5"><Settings size={6} /><span>Transactions</span></div>
                            <div className="flex items-center gap-0.5"><Settings size={6} /><span>Routing Rules</span></div>
                          </div>
                        </div>
                        <div 
                          className="bg-purple-100 border border-purple-300 rounded-lg p-2 cursor-pointer hover:ring-4 hover:ring-purple-200 transition-all"
                          onMouseEnter={() => handleMouseEnter('profile')}
                          onMouseLeave={handleMouseLeave}
                        >
                          <div className="text-[10px] font-semibold text-purple-800 mb-0.5">Profile {merchant.id}B</div>
                          <div className="text-[10px] text-gray-600 space-y-0">
                            <div className="flex items-center gap-0.5"><Settings size={6} /><span>Transactions</span></div>
                            <div className="flex items-center gap-0.5"><Settings size={6} /><span>Routing Rules</span></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold dark:text-white">Add Merchant</h2>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"><X size={20} /></button>
            </div>
            <input
              type="text"
              value={merchantName}
              onChange={(e) => setMerchantName(e.target.value)}
              placeholder="Merchant Name"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg mb-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Merchant Type</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="merchantType"
                    value="connected"
                    checked={merchantType === 'connected'}
                    onChange={(e) => setMerchantType(e.target.value)}
                    className="text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Connected - Shared customers and payment methods</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="merchantType"
                    value="standard"
                    checked={merchantType === 'standard'}
                    onChange={(e) => setMerchantType(e.target.value)}
                    className="text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Standard - Isolated customers and payment methods</span>
                </label>
              </div>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowAddModal(false)} 
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddMerchant}
                disabled={!merchantName.trim()}
                className="flex-1 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationManager;
