import React from 'react';
import Input from '../../Hooks/Input';
import Label from '../../Hooks/Label';
import FieldError from '../../Hooks/FieldError';
import Select from '../../Hooks/Select';
import Textarea from '../../Hooks/Textarea';
import { State } from "country-state-city";
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

const FormSlide3 = ({ data, setData, errors }) => {
    const indianStates = State.getStatesOfCountry("IN");
    const u = (field, val) => setData({ ...data, [field]: val });

    return (
        <div className="step-enter">
            <div className="mb-8">
                <p className="text-[11px] text-teal-400 font-semibold tracking-[2px] uppercase mb-2">Step 3 of 6</p>
                <h3 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'serif', fangsome" }}>Contact & location</h3>
                <p className="text-sm text-white/40">Help users find and contact your organization.</p>
            </div>

            <div className="flex flex-col gap-5">
                <div className="grid grid-cols-2 gap-4" style={{ animation: "fadeUp .4s .05s both" }}>
                    <div>
                        <Label required>Admin Contact Name</Label>
                        <Input placeholder="Full name" value={data.adminName} onChange={e => u("adminName", e.target.value)} />
                        <FieldError msg={errors.adminName} />
                    </div>
                    <div>
                        <Label required>Designation</Label>
                        <Input placeholder="e.g. Manager, Director" value={data.designation} onChange={e => u("designation", e.target.value)} />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4" style={{ animation: "fadeUp .4s .1s both" }}>
                    <div>
                        <Label required>Official Email</Label>
                        <Input type="email" placeholder="admin@yourorg.com" value={data.email} onChange={e => u("email", e.target.value)} />
                        <FieldError msg={errors.email} />
                    </div>
                    <div>
                        <Label required>Phone Number</Label>
                        <div className="custom-phone-container">
                            <PhoneInput
                                international
                                defaultCountry="IN"
                                placeholder="Enter phone number"
                                value={data.phone}
                                onChange={val => u("phone", val)}
                                className="smart-phone-input"
                            />
                        </div>
                        <FieldError msg={errors.phone} />
                    </div>
                </div>

                <div style={{ animation: "fadeUp .4s .15s both" }}>
                    <Label required>Full Address</Label>
                    <Textarea placeholder="Building, street, landmark..." rows={2} value={data.address} onChange={e => u("address", e.target.value)} />
                    <FieldError msg={errors.address} />
                </div>

                <div className="grid grid-cols-2 gap-4" style={{ animation: "fadeUp .4s .2s both" }}>
                    <div>
                        <Label required>City</Label>
                        <Input placeholder="e.g. Kolkata" value={data.city} onChange={e => u("city", e.target.value)} />
                        <FieldError msg={errors.city} />
                    </div>
                    <div>
                        <Label>Area / Locality</Label>
                        <Input placeholder="e.g. Park Street" value={data.area} onChange={e => u("area", e.target.value)} />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4" style={{ animation: "fadeUp .4s .25s both" }}>
                    <div>
                        <Label required>State</Label>
                        <Select
                            value={data.state}
                            onChange={(e) => u("state", e.target.value)}
                            className="modern-select"
                        >
                            <option value="">Select state</option>

                            {indianStates.map((state) => (
                                <option key={state.isoCode} value={state.name}>
                                    {state.name}
                                </option>
                            ))}
                        </Select>
                        <FieldError msg={errors.state} />
                    </div>
                    <div>
                        <Label required>PIN Code</Label>
                        <Input type="number" placeholder="6-digit PIN" value={data.pincode} onChange={e => u("pincode", e.target.value)} />
                        <FieldError msg={errors.pincode} />
                    </div>
                </div>

                <div style={{ animation: "fadeUp .4s .3s both" }}>
                    <Label>Website URL</Label>
                    <Input type="url" placeholder="https://yourorganization.com" value={data.website} onChange={e => u("website", e.target.value)} />
                </div>
            </div>
        </div>
    );
}

export default FormSlide3
