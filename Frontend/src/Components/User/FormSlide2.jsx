import React from 'react';
import FieldError from '../../Hooks/FieldError';
import Label from '../../Hooks/Label';
import Input from '../../Hooks/Input';
import Select from '../../Hooks/Select';
import Textarea from '../../Hooks/Textarea';
import TimeInput from '../../Hooks/TimeInput';

const FormSlide2 = ({ data, setData, errors }) => {
    const u = (field, val) => setData({ ...data, [field]: val });
    
    return (
        <div className="step-enter">
            <div className="mb-8">
                <p className="text-[11px] text-teal-400 font-semibold tracking-[2px] uppercase mb-2">Step 2 of 6</p>
                <h3 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'serif', fangsome" }}>Organization details</h3>
                <p className="text-sm text-white/40">This information will appear on your public profile.</p>
            </div>

            <div className="flex flex-col gap-5">
                <div style={{ animation: "fadeUp .4s .05s both" }}>
                    <Label required>Organization Full Name</Label>
                    <Input placeholder="e.g. City General Hospital" value={data.orgName} onChange={e => u("orgName", e.target.value)} />
                    <FieldError msg={errors.orgName} />
                </div>

                <div style={{ animation: "fadeUp .4s .1s both" }}>
                    <Label>Short Name / Display Name</Label>
                    <Input placeholder="e.g. City Hospital" value={data.shortName} onChange={e => u("shortName", e.target.value)} />
                    <p className="text-[11px] text-white/25 mt-1.5">Shown in compact views and map pins.</p>
                </div>

                <div className="grid grid-cols-2 gap-4" style={{ animation: "fadeUp .4s .15s both" }}>
                    <div>
                        <Label required>Registration Number</Label>
                        <Input placeholder="e.g. REG-2024-XXXXX" value={data.regNumber} onChange={e => u("regNumber", e.target.value)} />
                        <FieldError msg={errors.regNumber} />
                    </div>
                    <div>
                        <Label required>GST Number</Label>
                        <Input placeholder="e.g. 22AAAAA0000A1Z5" value={data.gstNumber} onChange={e => u("gstNumber", e.target.value)} />
                        <FieldError msg={errors.gstNumber} />
                    </div>
                </div>

                <div style={{ animation: "fadeUp .4s .2s both" }}>
                    <Label>About / Description</Label>
                    <Textarea placeholder="Brief description of your organization and services..." rows={3} value={data.description} onChange={e => u("description", e.target.value)} />
                </div>

                <div className="grid grid-cols-2 gap-4" style={{ animation: "fadeUp .4s .25s both" }}>
                    <div>
                        <Label required>Established Year</Label>
                        <Input type="number" placeholder="e.g. 2005" min="1900" max={new Date().getFullYear()} value={data.estYear} onChange={e => u("estYear", e.target.value)} />
                    </div>
                    <div>
                        <Label>Number of Staff</Label>
                        <Select value={data.staffCount} onChange={e => u("staffCount", e.target.value)}>
                            <option value="">Select range</option>
                            <option>1-10</option>
                            <option>11-50</option>
                            <option>51-200</option>
                            <option>201-500</option>
                            <option>500+</option>
                        </Select>
                    </div>
                </div>

                <div style={{ animation: "fadeUp .4s .3s both" }}>
                    <Label>Working Hours</Label>
                    <div className="grid grid-cols-2 gap-4">
                        <TimeInput 
                            label="Opens at" 
                            value={data.workStart || "09:00"} 
                            onChange={e => u("workStart", e.target.value)} 
                        />
                        <TimeInput 
                            label="Closes at" 
                            value={data.workEnd || "18:00"} 
                            onChange={e => u("workEnd", e.target.value)} 
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default FormSlide2
